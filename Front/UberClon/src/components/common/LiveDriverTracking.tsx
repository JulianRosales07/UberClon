import React, { useState, useEffect } from 'react';
import { Map } from './Map';
import { generateRouteKey, getCachedRoute } from '../../utils/routeCache';
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

interface LiveDriverTrackingProps {
  trip: Trip;
  initialDriverLocation?: Location;
  updateInterval?: number; // en milisegundos
}

export const LiveDriverTracking: React.FC<LiveDriverTrackingProps> = ({
  trip,
  initialDriverLocation,
  updateInterval = 1000 // 1 segundo por defecto (más rápido)
}) => {
  const [driverLocation, setDriverLocation] = useState<Location>(
    initialDriverLocation || {
      lat: trip.pickup.lat + (Math.random() - 0.5) * 0.02,
      lng: trip.pickup.lng + (Math.random() - 0.5) * 0.02,
      address: 'Conductor en camino'
    }
  );

  const [progress, setProgress] = useState(0);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);

  // Obtener la ruta real al inicializar
  useEffect(() => {
    const getRouteCoordinates = async () => {
      // Primero verificar caché
      const routeKey = generateRouteKey(trip.pickup, trip.destination);
      const cachedRoute = getCachedRoute(routeKey);

      if (cachedRoute) {
        console.log('🚀 Usando ruta desde caché para seguimiento');
        setRouteCoordinates(cachedRoute.coordinates);
        return;
      }

      // Si no hay caché, obtener de OSRM
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${trip.pickup.lng},${trip.pickup.lat};${trip.destination.lng},${trip.destination.lat}?overview=full&geometries=geojson`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coordinates = data.routes[0].geometry.coordinates;
            const leafletCoords: [number, number][] = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            setRouteCoordinates(leafletCoords);
            console.log('✅ Ruta obtenida para seguimiento del conductor');
          }
        }
      } catch (error) {
        console.error('Error obteniendo ruta para seguimiento:', error);
        // Fallback: crear puntos intermedios en línea recta
        const steps = 20;
        const coords: [number, number][] = [];
        for (let i = 0; i <= steps; i++) {
          const ratio = i / steps;
          const lat = trip.pickup.lat + (trip.destination.lat - trip.pickup.lat) * ratio;
          const lng = trip.pickup.lng + (trip.destination.lng - trip.pickup.lng) * ratio;
          coords.push([lat, lng]);
        }
        setRouteCoordinates(coords);
      }
    };

    getRouteCoordinates();
  }, [trip]);

  // Mover el conductor a lo largo de la ruta real
  useEffect(() => {
    if (routeCoordinates.length === 0) return;

    const interval = setInterval(() => {
      setCurrentRouteIndex(prev => {
        const nextIndex = Math.min(prev + 1, routeCoordinates.length - 1);

        if (nextIndex < routeCoordinates.length) {
          const [lat, lng] = routeCoordinates[nextIndex];
          const progressPercent = (nextIndex / (routeCoordinates.length - 1)) * 100;

          setDriverLocation({
            lat,
            lng,
            address: progressPercent < 50 ? 'Dirigiéndose al origen' : 'En camino al destino'
          });

          setProgress(progressPercent);
        }

        return nextIndex;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [routeCoordinates, updateInterval]);

  return (
    <Map
      center={driverLocation}
      pickup={trip.pickup}
      destination={trip.destination}
      driverLocation={driverLocation}
      showRoute={true}
      routeColor="#10B981"
    />
  );
};