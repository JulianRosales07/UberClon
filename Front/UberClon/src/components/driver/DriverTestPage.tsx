import React, { useState, useEffect } from 'react';
import { DriverMap } from './DriverMap';
import { useRideNotifications } from '../../hooks/useRideNotifications';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export const DriverTestPage: React.FC = () => {
  // Datos del conductor de prueba
  const [driverData] = useState({
    driverId: `driver_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Conductor de Prueba',
    location: {
      lat: 1.223789,
      lng: -77.283255
    }
  });

  // Ubicación actual del conductor
  const [driverLocation, setDriverLocation] = useState<Location>({
    lat: 1.223789,
    lng: -77.283255,
    address: 'Centro de Pasto'
  });

  // Estado del conductor
  const [isOnline, setIsOnline] = useState(false);
  const [acceptedRides, setAcceptedRides] = useState<any[]>([]);

  // Hook para notificaciones
  const {
    rideRequest,
    isConnected,
    acceptRide,
    rejectRide,
    updateLocation
  } = useRideNotifications(isOnline ? driverData : null, 'driver');

  // Actualizar ubicación cada 10 segundos (simular movimiento)
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      const newLocation = {
        lat: driverLocation.lat + (Math.random() - 0.5) * 0.001,
        lng: driverLocation.lng + (Math.random() - 0.5) * 0.001
      };
      
      setDriverLocation(prev => ({
        ...prev,
        ...newLocation
      }));
      
      updateLocation(newLocation);
    }, 10000);

    return () => clearInterval(interval);
  }, [isOnline, driverLocation, updateLocation]);

  const handleGoOnline = () => {
    setIsOnline(true);
  };

  const handleGoOffline = () => {
    setIsOnline(false);
  };

  const handleAcceptRide = () => {
    if (rideRequest) {
      acceptRide(rideRequest.rideId, driverData.driverId);
      setAcceptedRides(prev => [...prev, rideRequest]);
    }
  };

  const handleRejectRide = (reason?: string) => {
    if (rideRequest) {
      rejectRide(rideRequest.rideId, driverData.driverId, reason);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header del conductor */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🚗 {driverData.name}</h1>
            <p className="text-sm text-blue-100">ID: {driverData.driverId}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Indicador de conexión */}
            <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-3 py-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''}`}></div>
              <span className="text-sm font-medium">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>

            {/* Botón de estado */}
            {isOnline ? (
              <button
                onClick={handleGoOffline}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg"
              >
                🔴 Desconectarse
              </button>
            ) : (
              <button
                onClick={handleGoOnline}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg"
              >
                🟢 Conectarse
              </button>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className={`rounded-lg p-3 ${isOnline ? 'bg-green-100 border-2 border-green-200' : 'bg-gray-100'}`}>
            <div className={`text-lg font-bold ${isOnline ? 'text-green-700' : 'text-gray-700'}`}>
              {isOnline ? '🟢 En línea' : '🔴 Offline'}
            </div>
            <div className="text-sm text-gray-600">Estado</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-3 border-2 border-blue-200">
            <div className="text-lg font-bold text-blue-700">{acceptedRides.length}</div>
            <div className="text-sm text-gray-600">Viajes aceptados</div>
          </div>
          <div className={`rounded-lg p-3 ${rideRequest ? 'bg-orange-100 border-2 border-orange-200 animate-pulse' : 'bg-gray-100'}`}>
            <div className={`text-lg font-bold ${rideRequest ? 'text-orange-700' : 'text-gray-700'}`}>
              {rideRequest ? '🔔 1' : '0'}
            </div>
            <div className="text-sm text-gray-600">Solicitudes pendientes</div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1">
        <DriverMap
          center={driverLocation}
          driverLocation={driverLocation}
          driverId={driverData.driverId}
          driverName={driverData.name}
        />
      </div>

      {/* Panel de información */}
      <div className="bg-white border-t p-4">
        <div className="text-center">
          {!isOnline ? (
            <div className="text-gray-600">
              <p className="mb-2">🚗 Conéctate para recibir solicitudes de viaje</p>
              <p className="text-sm">Haz clic en "Conectarse" para empezar a recibir notificaciones</p>
            </div>
          ) : !rideRequest ? (
            <div className="text-green-600">
              <p className="mb-2">✅ En línea y disponible</p>
              <p className="text-sm">Esperando solicitudes de viaje...</p>
            </div>
          ) : (
            <div className="text-blue-600">
              <p className="mb-2">🔔 Tienes una solicitud de viaje pendiente</p>
              <p className="text-sm">Revisa la notificación para aceptar o rechazar</p>
            </div>
          )}
        </div>

        {/* Historial de viajes aceptados */}
        {acceptedRides.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Viajes aceptados hoy:</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {acceptedRides.map((ride, index) => (
                <div key={index} className="bg-gray-100 rounded p-2 text-sm">
                  <div className="flex justify-between">
                    <span>Viaje #{ride.rideId.slice(-6)}</span>
                    <span className="text-green-600">✅ Aceptado</span>
                  </div>
                  <div className="text-gray-600">
                    {ride.pickup.address} → {ride.destination.address}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};