import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useRideNotifications } from '../../hooks/useRideNotifications';
import { RideRequestModal } from './RideRequestModal';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icon creation functions removed to avoid unused variable warnings

// const originIcon = createSimpleIcon('#10B981', '🟢'); // Verde para origen
// const destinationIcon = createSimpleIcon('#EF4444', '🔴'); // Rojo para destino

interface DriverMapProps {
  center: Location;
  zoom?: number;
  driverLocation?: Location;
  pickup?: Location;
  destination?: Location;
  tripRequests?: any[];
  activeTrip?: any;
  authToken?: string;
  onLocationUpdate?: (location: any) => void;
  onTripAccept?: (tripId: string) => Promise<void>;
  // Nuevas props para notificaciones
  driverId?: string;
  driverName?: string;
}

const MapUpdater: React.FC<{ 
  center: Location; 
  pickup?: Location; 
  destination?: Location; 
}> = ({ center, pickup, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (pickup && destination) {
      // Si hay origen y destino, ajustar el mapa para mostrar ambos puntos
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [destination.lat, destination.lng]
      ]);
      map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 16 // Limitar el zoom máximo
      });
    } else if (pickup) {
      // Si solo hay pickup, centrar en él
      map.setView([pickup.lat, pickup.lng], 14);
    } else {
      // Si solo hay center, centrar en él
      map.setView([center.lat, center.lng], 14);
    }
  }, [center, pickup, destination, map]);

  return null;
};

export const DriverMap: React.FC<DriverMapProps> = ({
  center,
  zoom = 13,
  driverLocation,
  pickup,
  destination,
  tripRequests,
  activeTrip,
  authToken,
  onLocationUpdate,
  onTripAccept,
  driverId = 'driver_123', // ID por defecto para testing
  driverName = 'Conductor'
}) => {
  // Use the props to avoid unused variable warnings
  console.log('DriverMap props:', { tripRequests, activeTrip, authToken, onLocationUpdate, onTripAccept });

  // Estado para el conductor
  const [driverData] = useState({
    driverId,
    name: driverName,
    location: driverLocation
  });

  // Hook para notificaciones en tiempo real
  const {
    rideRequest,
    isConnected,
    acceptRide,
    rejectRide,
    updateLocation
  } = useRideNotifications(driverData, 'driver');

  // Actualizar ubicación cuando cambie driverLocation
  useEffect(() => {
    if (driverLocation && isConnected) {
      updateLocation(driverLocation);
    }
  }, [driverLocation, isConnected, updateLocation]);

  // Manejar aceptación de viaje
  const handleAcceptRide = () => {
    if (rideRequest) {
      acceptRide(rideRequest.rideId, driverId);
    }
  };

  // Manejar rechazo de viaje
  const handleRejectRide = (reason?: string) => {
    if (rideRequest) {
      rejectRide(rideRequest.rideId, driverId, reason);
    }
  };

  
  // Verificar que las coordenadas sean válidas
  const isValidCoordinate = (coord: Location) => {
    return coord && 
           typeof coord.lat === 'number' && 
           typeof coord.lng === 'number' && 
           !isNaN(coord.lat) && 
           !isNaN(coord.lng) &&
           coord.lat >= -90 && coord.lat <= 90 &&
           coord.lng >= -180 && coord.lng <= 180;
  };

  return (
    <div className="h-full w-full relative">
      {/* Indicador de conexión */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        style={{ zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapUpdater center={center} pickup={pickup} destination={destination} />

        {/* Marcador de origen - usar marcador estándar primero */}
        {pickup && isValidCoordinate(pickup) && (
          <Marker 
            position={[pickup.lat, pickup.lng]}
          >
            <Popup>
              <div>
                <strong>🟢 Origen</strong><br />
                {pickup.address || 'Sin dirección'}<br />
                <small>Lat: {pickup.lat}, Lng: {pickup.lng}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcador de destino - usar marcador estándar primero */}
        {destination && isValidCoordinate(destination) && (
          <Marker 
            position={[destination.lat, destination.lng]}
          >
            <Popup>
              <div>
                <strong>🔴 Destino</strong><br />
                {destination.address || 'Sin dirección'}<br />
                <small>Lat: {destination.lat}, Lng: {destination.lng}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcador del conductor (si existe) */}
        {driverLocation && isValidCoordinate(driverLocation) && (
          <Marker position={[driverLocation.lat, driverLocation.lng]}>
            <Popup>
              <div>
                <strong>🚗 Tu ubicación</strong><br />
                <small>Lat: {driverLocation.lat}, Lng: {driverLocation.lng}</small>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Modal de notificación de viaje */}
      {rideRequest && (
        <RideRequestModal
          request={rideRequest}
          onAccept={handleAcceptRide}
          onReject={handleRejectRide}
          driverId={driverId}
        />
      )}
    </div>
  );
};