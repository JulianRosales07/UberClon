// Almacenamiento en memoria para conductores conectados
const connectedDrivers = new Map();
const connectedPassengers = new Map();
const activeRideRequests = new Map();

// Función para calcular distancia entre dos puntos (fórmula de Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Función para encontrar conductores cercanos
function findNearbyDrivers(pickupLat, pickupLng, radiusKm = 5) {
  const nearbyDrivers = [];
  
  connectedDrivers.forEach((driver, socketId) => {
    if (driver.status === 'available' && driver.location) {
      const distance = calculateDistance(
        pickupLat, pickupLng,
        driver.location.lat, driver.location.lng
      );
      
      if (distance <= radiusKm) {
        nearbyDrivers.push({
          ...driver,
          socketId,
          distance
        });
      }
    }
  });
  
  // Ordenar por distancia
  return nearbyDrivers.sort((a, b) => a.distance - b.distance);
}

module.exports = (io) => {
  console.log('🔌 Configurando Socket.IO para notificaciones en tiempo real...');
  
  io.on('connection', (socket) => {
    console.log(`📱 Nueva conexión: ${socket.id}`);
    
    // Conductor se conecta
    socket.on('driver-online', (driverData) => {
      console.log(`🚗 Conductor conectado: ${driverData.driverId}`);
      
      connectedDrivers.set(socket.id, {
        driverId: driverData.driverId,
        name: driverData.name || 'Conductor',
        location: driverData.location,
        status: 'available',
        connectedAt: new Date()
      });
      
      socket.emit('driver-status-updated', { status: 'online' });
    });
    
    // Pasajero se conecta
    socket.on('passenger-online', (passengerData) => {
      console.log(`👤 Pasajero conectado: ${passengerData.passengerId}`);
      
      connectedPassengers.set(socket.id, {
        passengerId: passengerData.passengerId,
        name: passengerData.name || 'Pasajero',
        connectedAt: new Date()
      });
      
      socket.emit('passenger-status-updated', { status: 'online' });
    });
    
    // Actualizar ubicación del conductor
    socket.on('update-driver-location', (locationData) => {
      const driver = connectedDrivers.get(socket.id);
      if (driver) {
        driver.location = locationData;
        connectedDrivers.set(socket.id, driver);
      }
    });
    
    // Solicitar viaje
    socket.on('request-ride', (rideData) => {
      console.log(`🚕 Nueva solicitud de viaje: ${rideData.rideId}`);
      
      const nearbyDrivers = findNearbyDrivers(
        rideData.pickup.lat,
        rideData.pickup.lng,
        5 // 5km de radio
      );
      
      if (nearbyDrivers.length === 0) {
        socket.emit('no-drivers-available');
        return;
      }
      
      // Crear solicitud de viaje
      const rideRequest = {
        rideId: rideData.rideId,
        passengerId: rideData.passengerId,
        passengerName: rideData.passengerName,
        pickup: rideData.pickup,
        destination: rideData.destination,
        estimatedFare: rideData.estimatedFare,
        requestedAt: new Date(),
        status: 'pending',
        nearbyDrivers: nearbyDrivers.map(d => d.socketId),
        currentDriverIndex: 0
      };
      
      activeRideRequests.set(rideData.rideId, rideRequest);
      
      // Enviar a primer conductor disponible
      const firstDriver = nearbyDrivers[0];
      io.to(firstDriver.socketId).emit('new-ride-request', {
        rideId: rideRequest.rideId,
        passenger: {
          name: rideRequest.passengerName,
          id: rideRequest.passengerId
        },
        pickup: rideRequest.pickup,
        destination: rideRequest.destination,
        estimatedFare: rideRequest.estimatedFare,
        distance: firstDriver.distance.toFixed(1)
      });
      
      // Marcar conductor como ocupado temporalmente
      const driver = connectedDrivers.get(firstDriver.socketId);
      if (driver) {
        driver.status = 'pending_response';
        connectedDrivers.set(firstDriver.socketId, driver);
      }
      
      // Timeout de 30 segundos
      setTimeout(() => {
        const request = activeRideRequests.get(rideData.rideId);
        if (request && request.status === 'pending') {
          // Auto-rechazar y enviar al siguiente conductor
          handleRideTimeout(rideData.rideId, firstDriver.socketId);
        }
      }, 30000);
      
      socket.emit('ride-request-sent', { 
        message: 'Buscando conductor disponible...',
        driversFound: nearbyDrivers.length
      });
    });
    
    // Conductor acepta viaje
    socket.on('accept-ride', (data) => {
      console.log(`✅ Viaje aceptado: ${data.rideId} por conductor ${data.driverId}`);
      
      const request = activeRideRequests.get(data.rideId);
      if (!request || request.status !== 'pending') {
        socket.emit('ride-no-longer-available');
        return;
      }
      
      // Actualizar estado del viaje
      request.status = 'accepted';
      request.acceptedBy = data.driverId;
      request.acceptedAt = new Date();
      
      // Actualizar estado del conductor
      const driver = connectedDrivers.get(socket.id);
      if (driver) {
        driver.status = 'busy';
        connectedDrivers.set(socket.id, driver);
      }
      
      // Notificar al pasajero
      const passengerSocket = findPassengerSocket(request.passengerId);
      if (passengerSocket) {
        io.to(passengerSocket).emit('driver-accepted', {
          driverId: data.driverId,
          driverName: driver?.name || 'Conductor',
          estimatedArrival: '5-10 minutos',
          driverLocation: driver?.location
        });
      }
      
      // Confirmar al conductor
      socket.emit('ride-accepted-confirmation', {
        rideId: data.rideId,
        passenger: {
          name: request.passengerName,
          id: request.passengerId
        },
        pickup: request.pickup,
        destination: request.destination
      });
      
      activeRideRequests.set(data.rideId, request);
    });
    
    // Conductor rechaza viaje
    socket.on('reject-ride', (data) => {
      console.log(`❌ Viaje rechazado: ${data.rideId} por conductor ${data.driverId}`);
      handleRideRejection(data.rideId, socket.id);
    });
    
    // Desconexión
    socket.on('disconnect', () => {
      console.log(`📱 Desconexión: ${socket.id}`);
      
      // Limpiar conductor
      const driver = connectedDrivers.get(socket.id);
      if (driver) {
        console.log(`🚗 Conductor desconectado: ${driver.driverId}`);
        connectedDrivers.delete(socket.id);
      }
      
      // Limpiar pasajero
      const passenger = connectedPassengers.get(socket.id);
      if (passenger) {
        console.log(`👤 Pasajero desconectado: ${passenger.passengerId}`);
        connectedPassengers.delete(socket.id);
      }
    });
  });
  
  // Función para manejar timeout de viajes
  function handleRideTimeout(rideId, driverSocketId) {
    console.log(`⏰ Timeout para viaje: ${rideId}`);
    
    // Liberar conductor
    const driver = connectedDrivers.get(driverSocketId);
    if (driver) {
      driver.status = 'available';
      connectedDrivers.set(driverSocketId, driver);
    }
    
    // Enviar al siguiente conductor
    handleRideRejection(rideId, driverSocketId, true);
  }
  
  // Función para manejar rechazo de viajes
  function handleRideRejection(rideId, driverSocketId, isTimeout = false) {
    const request = activeRideRequests.get(rideId);
    if (!request || request.status !== 'pending') return;
    
    // Liberar conductor actual
    const driver = connectedDrivers.get(driverSocketId);
    if (driver) {
      driver.status = 'available';
      connectedDrivers.set(driverSocketId, driver);
    }
    
    // Intentar con siguiente conductor
    request.currentDriverIndex++;
    
    if (request.currentDriverIndex >= request.nearbyDrivers.length) {
      // No hay más conductores disponibles
      const passengerSocket = findPassengerSocket(request.passengerId);
      if (passengerSocket) {
        io.to(passengerSocket).emit('no-drivers-available');
      }
      activeRideRequests.delete(rideId);
      return;
    }
    
    // Enviar al siguiente conductor
    const nextDriverSocketId = request.nearbyDrivers[request.currentDriverIndex];
    const nextDriver = connectedDrivers.get(nextDriverSocketId);
    
    if (nextDriver && nextDriver.status === 'available') {
      io.to(nextDriverSocketId).emit('new-ride-request', {
        rideId: request.rideId,
        passenger: {
          name: request.passengerName,
          id: request.passengerId
        },
        pickup: request.pickup,
        destination: request.destination,
        estimatedFare: request.estimatedFare
      });
      
      // Marcar como ocupado temporalmente
      nextDriver.status = 'pending_response';
      connectedDrivers.set(nextDriverSocketId, nextDriver);
      
      // Nuevo timeout
      setTimeout(() => {
        const currentRequest = activeRideRequests.get(rideId);
        if (currentRequest && currentRequest.status === 'pending') {
          handleRideTimeout(rideId, nextDriverSocketId);
        }
      }, 30000);
    } else {
      // Conductor no disponible, intentar con el siguiente
      handleRideRejection(rideId, nextDriverSocketId, true);
    }
  }
  
  // Función auxiliar para encontrar socket del pasajero
  function findPassengerSocket(passengerId) {
    for (const [socketId, passenger] of connectedPassengers.entries()) {
      if (passenger.passengerId === passengerId) {
        return socketId;
      }
    }
    return null;
  }
  
  // Función para obtener estadísticas (útil para debugging)
  setInterval(() => {
    console.log(`📊 Estadísticas: ${connectedDrivers.size} conductores, ${connectedPassengers.size} pasajeros, ${activeRideRequests.size} solicitudes activas`);
  }, 60000); // Cada minuto
};