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

interface MapProps {
  center: Location;
  zoom?: number;
  pickup?: Location;
  destination?: Location;
  drivers?: Driver[];
  className?: string;
}

const MapUpdater: React.FC<{ center: Location }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  
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
        
        <MapUpdater center={center} />
        
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]}>
            <Popup>Punto de recogida</Popup>
          </Marker>
        )}
        
        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>Destino</Popup>
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