import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface RideRequest {
  rideId: string;
  passenger: {
    name: string;
    id: string;
  };
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  estimatedFare: number;
  distance?: string;
}

interface DriverData {
  driverId: string;
  name: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface PassengerData {
  passengerId: string;
  name: string;
}

interface UseRideNotificationsReturn {
  socket: Socket | null;
  rideRequest: RideRequest | null;
  isConnected: boolean;
  acceptRide: (rideId: string, driverId: string) => void;
  rejectRide: (rideId: string, driverId: string, reason?: string) => void;
  updateLocation: (location: { lat: number; lng: number }) => void;
  requestRide: (rideData: any) => void;
  clearRideRequest: () => void;
}

export const useRideNotifications = (
  userData: DriverData | PassengerData | null,
  userType: 'driver' | 'passenger'
): UseRideNotificationsReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rideRequest, setRideRequest] = useState<RideRequest | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userData) return;

    // Solicitar permisos de notificación para conductores
    if (userType === 'driver' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('Permiso de notificaciones:', permission);
        });
      }
    }

    console.log(`🔌 Conectando ${userType}:`, userData);
    
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log(`✅ Conectado como ${userType}:`, newSocket.id);
      setIsConnected(true);
      
      // Registrar usuario según tipo
      if (userType === 'driver') {
        newSocket.emit('driver-online', userData);
      } else {
        newSocket.emit('passenger-online', userData);
      }
    });

    newSocket.on('disconnect', () => {
      console.log(`❌ Desconectado ${userType}`);
      setIsConnected(false);
    });

    // Eventos para conductores
    if (userType === 'driver') {
      newSocket.on('new-ride-request', (request: RideRequest) => {
        console.log('🚕 Nueva solicitud de viaje recibida:', request);
        setRideRequest(request);
        
        // Reproducir sonido de notificación y vibrar
        try {
          // Crear sonido usando Web Audio API
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
          console.log('Audio no disponible:', e);
        }
        
        // Vibrar si está disponible
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        // Mostrar notificación del navegador
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚕 Nueva solicitud de viaje', {
            body: `Pasajero: ${request.passenger.name}\nOrigen: ${request.pickup.address}`,
            icon: '/favicon.ico',
            tag: 'ride-request'
          });
        }
      });

      newSocket.on('ride-accepted-confirmation', (data) => {
        console.log('✅ Confirmación de viaje aceptado:', data);
        setRideRequest(null);
      });

      newSocket.on('ride-no-longer-available', () => {
        console.log('⚠️ El viaje ya no está disponible');
        setRideRequest(null);
      });

      newSocket.on('driver-status-updated', (data) => {
        console.log('📊 Estado del conductor actualizado:', data);
      });
    }

    // Eventos para pasajeros
    if (userType === 'passenger') {
      newSocket.on('driver-accepted', (driverData) => {
        console.log('🎉 ¡Conductor encontrado!:', driverData);
        // Este evento se manejará en el componente del pasajero
      });

      newSocket.on('no-drivers-available', () => {
        console.log('😔 No hay conductores disponibles');
        // Este evento se manejará en el componente del pasajero
      });

      newSocket.on('ride-request-sent', (data) => {
        console.log('📤 Solicitud enviada:', data);
      });

      newSocket.on('passenger-status-updated', (data) => {
        console.log('📊 Estado del pasajero actualizado:', data);
      });
    }

    newSocket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log(`🔌 Cerrando conexión ${userType}`);
      newSocket.close();
    };
  }, [userData, userType]);

  const acceptRide = useCallback((rideId: string, driverId: string) => {
    if (socket && userType === 'driver') {
      console.log(`✅ Aceptando viaje: ${rideId}`);
      socket.emit('accept-ride', { rideId, driverId });
    }
  }, [socket, userType]);

  const rejectRide = useCallback((rideId: string, driverId: string, reason?: string) => {
    if (socket && userType === 'driver') {
      console.log(`❌ Rechazando viaje: ${rideId}`);
      socket.emit('reject-ride', { rideId, driverId, reason });
      setRideRequest(null);
    }
  }, [socket, userType]);

  const updateLocation = useCallback((location: { lat: number; lng: number }) => {
    if (socket && userType === 'driver') {
      socket.emit('update-driver-location', location);
    }
  }, [socket, userType]);

  const requestRide = useCallback((rideData: any) => {
    if (socket && userType === 'passenger') {
      console.log('🚕 Solicitando viaje:', rideData);
      socket.emit('request-ride', rideData);
    }
  }, [socket, userType]);

  const clearRideRequest = useCallback(() => {
    setRideRequest(null);
  }, []);

  return {
    socket,
    rideRequest,
    isConnected,
    acceptRide,
    rejectRide,
    updateLocation,
    requestRide,
    clearRideRequest
  };
};