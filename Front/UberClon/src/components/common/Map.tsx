import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicleInfo: {
    make: string;
    model: string;
  };
  location: Location;
}

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Crear iconos personalizados para origen y destino
const createCustomIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        position: relative;
        z-index: 1000;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const pickupIcon = createCustomIcon('#10B981', '🟢'); // Verde para origen
const destinationIcon = createCustomIcon('#EF4444', '🔴'); // Rojo para destino

interface MapProps {
  center: Location;
  zoom?: number;
  pickup?: Location | null;
  destination?: Location | null;
  drivers?: Driver[];
  className?: string;
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
        maxZoom: 16
      });
    } else if (pickup) {
      // Si solo hay pickup, centrar en él
      map.setView([pickup.lat, pickup.lng], 14);
    } else {
      // Si solo hay center, centrar en él
      map.setView([center.lat, center.lng], 13);
    }
  }, [center, pickup, destination, map]);
  
  return null;
};

export const Map: React.FC<MapProps> = ({
  center,
  zoom = 13,
  pickup,
  destination,
  drivers = [],
  className = "h-full w-full"
}) => {
  return (
    <div className={className}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater center={center} pickup={pickup} destination={destination} />
        
        {pickup && (
          <Marker 
            position={[pickup.lat, pickup.lng]}
            icon={pickupIcon}
          >
            <Popup>
              <div>
                <strong>🟢 Punto de recogida</strong><br />
                {pickup.address || 'Sin dirección'}<br />
                <small>Lat: {pickup.lat}, Lng: {pickup.lng}</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {destination && (
          <Marker 
            position={[destination.lat, destination.lng]}
            icon={destinationIcon}
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
        
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            position={[driver.location.lat, driver.location.lng]}
          >
            <Popup>
              <div>
                <p className="font-semibold">{driver.name}</p>
                <p>{driver.vehicleInfo.make} {driver.vehicleInfo.model}</p>
                <p>Rating: {driver.rating}⭐</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};