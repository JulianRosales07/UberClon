const express = require('express');
const router = express.Router();

// Simulación de base de datos en memoria para viajes
const rides = new Map();
let rideIdCounter = 1;

// Crear nueva solicitud de viaje
router.post('/request', (req, res) => {
  try {
    const { passengerId, passengerName, pickup, destination, estimatedFare } = req.body;
    
    if (!passengerId || !pickup || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Datos requeridos: passengerId, pickup, destination'
      });
    }
    
    const rideId = `ride_${rideIdCounter++}`;
    const ride = {
      rideId,
      passengerId,
      passengerName: passengerName || 'Pasajero',
      pickup,
      destination,
      estimatedFare: estimatedFare || 0,
      status: 'requested',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    rides.set(rideId, ride);
    
    console.log(`🚕 Nueva solicitud de viaje creada: ${rideId}`);
    
    res.status(201).json({
      success: true,
      data: ride,
      message: 'Solicitud de viaje creada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al crear solicitud de viaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener información de un viaje
router.get('/:rideId', (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = rides.get(rideId);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Viaje no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: ride
    });
    
  } catch (error) {
    console.error('Error al obtener viaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Aceptar viaje (conductor)
router.post('/:rideId/accept', (req, res) => {
  try {
    const { rideId } = req.params;
    const { driverId, driverName } = req.body;
    
    const ride = rides.get(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Viaje no encontrado'
      });
    }
    
    if (ride.status !== 'requested' && ride.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'El viaje ya no está disponible'
      });
    }
    
    ride.status = 'accepted';
    ride.driverId = driverId;
    ride.driverName = driverName || 'Conductor';
    ride.acceptedAt = new Date();
    ride.updatedAt = new Date();
    
    rides.set(rideId, ride);
    
    console.log(`✅ Viaje aceptado: ${rideId} por conductor ${driverId}`);
    
    res.json({
      success: true,
      data: ride,
      message: 'Viaje aceptado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al aceptar viaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Rechazar viaje (conductor)
router.post('/:rideId/reject', (req, res) => {
  try {
    const { rideId } = req.params;
    const { driverId, reason } = req.body;
    
    const ride = rides.get(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Viaje no encontrado'
      });
    }
    
    // Agregar rechazo al historial
    if (!ride.rejections) {
      ride.rejections = [];
    }
    
    ride.rejections.push({
      driverId,
      reason: reason || 'No especificado',
      rejectedAt: new Date()
    });
    
    ride.updatedAt = new Date();
    rides.set(rideId, ride);
    
    console.log(`❌ Viaje rechazado: ${rideId} por conductor ${driverId}`);
    
    res.json({
      success: true,
      message: 'Rechazo registrado'
    });
    
  } catch (error) {
    console.error('Error al rechazar viaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Cancelar viaje (pasajero)
router.post('/:rideId/cancel', (req, res) => {
  try {
    const { rideId } = req.params;
    const { passengerId, reason } = req.body;
    
    const ride = rides.get(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Viaje no encontrado'
      });
    }
    
    if (ride.passengerId !== passengerId) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para cancelar este viaje'
      });
    }
    
    ride.status = 'cancelled';
    ride.cancelledAt = new Date();
    ride.cancellationReason = reason || 'No especificado';
    ride.updatedAt = new Date();
    
    rides.set(rideId, ride);
    
    console.log(`🚫 Viaje cancelado: ${rideId} por pasajero ${passengerId}`);
    
    res.json({
      success: true,
      data: ride,
      message: 'Viaje cancelado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al cancelar viaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Completar viaje
router.post('/:rideId/complete', (req, res) => {
  try {
    const { rideId } = req.params;
    const { driverId, finalFare } = req.body;
    
    const ride = rides.get(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Viaje no encontrado'
      });
    }
    
    if (ride.driverId !== driverId) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para completar este viaje'
      });
    }
    
    ride.status = 'completed';
    ride.completedAt = new Date();
    ride.finalFare = finalFare || ride.estimatedFare;
    ride.updatedAt = new Date();
    
    rides.set(rideId, ride);
    
    console.log(`🏁 Viaje completado: ${rideId}`);
    
    res.json({
      success: true,
      data: ride,
      message: 'Viaje completado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al completar viaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener historial de viajes de un pasajero
router.get('/passenger/:passengerId/history', (req, res) => {
  try {
    const { passengerId } = req.params;
    const passengerRides = [];
    
    rides.forEach((ride) => {
      if (ride.passengerId === passengerId) {
        passengerRides.push(ride);
      }
    });
    
    // Ordenar por fecha más reciente
    passengerRides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: passengerRides,
      count: passengerRides.length
    });
    
  } catch (error) {
    console.error('Error al obtener historial de pasajero:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener historial de viajes de un conductor
router.get('/driver/:driverId/history', (req, res) => {
  try {
    const { driverId } = req.params;
    const driverRides = [];
    
    rides.forEach((ride) => {
      if (ride.driverId === driverId) {
        driverRides.push(ride);
      }
    });
    
    // Ordenar por fecha más reciente
    driverRides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: driverRides,
      count: driverRides.length
    });
    
  } catch (error) {
    console.error('Error al obtener historial de conductor:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;