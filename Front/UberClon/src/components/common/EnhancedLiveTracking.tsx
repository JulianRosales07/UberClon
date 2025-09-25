import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { generateRouteKey, getCachedRoute, setCachedRoute } from '../../utils/routeCache';
import { getOptimalRoute } from '../../utils/routeGenerator';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface Trip {
  id: string;
  pickup: Location;
  destination: Location;
  status: string;
}

interface EnhancedLiveTrackingProps {
  trip: Trip;
  initialDriverLocation?: Location;
  updateInterval?: number;
  routeColor?: string;
}

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Crear iconos personalizados
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

const pickupIcon = createCustomIcon('#10B981', '🟢');
const destinationIcon = createCustomIcon('#EF4444', '🔴');
const driverIcon = createCustomIcon('#3B82F6', '🚗');

const MapUpdater: React.FC<{ routeCoordinates: [number, number][] }> = ({ routeCoordinates }) => {
  const map = useMap();
  
  useEffect(() => {
    if (routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [routeCoordinates, map]);
  
  return null;
};

export const EnhancedLiveTracking: React.FC<EnhancedLiveTrackingProps> = ({
  trip,
  initialDriverLocation,
  updateInterval = 800,
  routeColor = '#10B981'
}) => {
  const [driverLocation, setDriverLocation] = useState<Location>(
    initialDriverLocation || {
      lat: trip.pickup.lat,
      lng: trip.pickup.lng,
      address: 'Conductor iniciando viaje'
    }
  );

  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Obtener la ruta real al inicializar
  useEffect(() => {
    const getRouteCoordinates = async () => {
      const routeKey = generateRouteKey(trip.pickup, trip.destination);
      const cachedRoute = getCachedRoute(routeKey);
      
      if (cachedRoute) {
        console.log('🚀 Usando ruta desde caché para seguimiento mejorado');
        setRouteCoordinates(cachedRoute.coordinates);
        return;
      }

      try {
        console.log('🔄 Obteniendo ruta real de calles para seguimiento...');
        
        // Intentar obtener ruta real de OSRM
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${trip.pickup.lng},${trip.pickup.lat};${trip.destination.lng},${trip.destination.lat}?overview=full&geometries=geojson`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates;
            const leafletCoords: [number, number][] = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            
            // Guardar en caché
            setCachedRoute(routeKey, {
              coordinates: leafletCoords,
              duration: route.duration || 0,
              distance: route.distance || 0
            });
            
            setRouteCoordinates(leafletCoords);
            console.log('✅ Ruta real de calles obtenida con', leafletCoords.length, 'puntos');
            return;
          }
        }

        throw new Error('OSRM no disponible');

      } catch (error) {
        console.log('❌ Error obteniendo ruta real, usando fallback suavizado:', error.message);
        
        // Fallback: crear ruta suavizada que simule calles con más puntos
        const steps = 60; // Más puntos para movimiento más suave
        const coords: [number, number][] = [];
        
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          let lat = trip.pickup.lat + (trip.destination.lat - trip.pickup.lat) * t;
          let lng = trip.pickup.lng + (trip.destination.lng - trip.pickup.lng) * t;
          
          // Agregar variación suave para simular calles
          const variation = Math.sin(t * Math.PI * 3) * 0.001;
          lat += variation;
          lng += Math.cos(t * Math.PI * 2) * 0.0008;
          
          coords.push([lat, lng]);
        }
        
        setRouteCoordinates(coords);
        console.log('✅ Ruta fallback suavizada creada con', coords.length, 'puntos');
      }
    };

    getRouteCoordinates();
  }, [trip]);

  // Mover el conductor a lo largo de la ruta real
  useEffect(() => {
    if (routeCoordinates.length === 0) return;

    const interval = setInterval(() => {
      setCurrentRouteIndex(prev => {
        const nextIndex = Math.min(prev + 3, routeCoordinates.length - 1); // Mover 3 puntos por vez para mayor velocidad
        
        if (nextIndex < routeCoordinates.length) {
          const [lat, lng] = routeCoordinates[nextIndex];
          const progressPercent = (nextIndex / (routeCoordinates.length - 1)) * 100;
          
          setDriverLocation({
            lat,
            lng,
            address: progressPercent < 20 ? 'Iniciando viaje' : 
                    progressPercent < 80 ? 'En camino al destino' : 'Llegando al destino'
          });
          
          setProgress(progressPercent);
        }
        
        return nextIndex;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [routeCoordinates, updateInterval]);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[trip.pickup.lat, trip.pickup.lng]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapUpdater routeCoordinates={routeCoordinates} />

        {/* Mostrar ruta completa */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: routeColor,
              weight: 5,
              opacity: 0.7,
              dashArray: '10, 5'
            }}
          />
        )}

        {/* Marcador de origen */}
        <Marker position={[trip.pickup.lat, trip.pickup.lng]} icon={pickupIcon}>
          <Popup>
            <div>
              <strong>🟢 Punto de recogida</strong><br />
              {trip.pickup.address || 'Origen del viaje'}
            </div>
          </Popup>
        </Marker>

        {/* Marcador de destino */}
        <Marker position={[trip.destination.lat, trip.destination.lng]} icon={destinationIcon}>
          <Popup>
            <div>
              <strong>🔴 Destino</strong><br />
              {trip.destination.address || 'Destino del viaje'}
            </div>
          </Popup>
        </Marker>

        {/* Marcador del conductor en movimiento */}
        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
          <Popup>
            <div>
              <strong>🚗 Tu conductor</strong><br />
              {driverLocation.address}<br />
              <small>Progreso: {Math.round(progress)}%</small>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};