import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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

// Crear iconos personalizados simples
const createSimpleIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
        z-index: 1000;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const originIcon = createSimpleIcon('#10B981', '🟢'); // Verde para origen
const destinationIcon = createSimpleIcon('#EF4444', '🔴'); // Rojo para destino

interface DriverMapProps {
  center: Location;
  zoom?: number;
  driverLocation?: Location;
  pickup?: Location;
  destination?: Location;
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
  destination
}) => {

  
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
    <div className="h-full w-full">
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
    </div>
  );
};