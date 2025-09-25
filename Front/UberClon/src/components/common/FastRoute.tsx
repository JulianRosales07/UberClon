import React, { useEffect, useState } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface FastRouteProps {
  start: {
    lat: number;
    lng: number;
  };
  end: {
    lat: number;
    lng: number;
  };
  color?: string;
  weight?: number;
  opacity?: number;
  useRealRoute?: boolean; // Si es false, usa línea recta inmediatamente
}

export const FastRoute: React.FC<FastRouteProps> = ({
  start,
  end,
  color = '#2563eb',
  weight = 4,
  opacity = 0.8,
  useRealRoute = false
}) => {
  const map = useMap();
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!start || !end) return;

    // Si no queremos ruta real, usar línea recta inmediatamente
    if (!useRealRoute) {
      const straightLine: [number, number][] = [
        [start.lat, start.lng],
        [end.lat, end.lng]
      ];
      setRouteCoordinates(straightLine);
      
      // Ajustar vista para mostrar ambos puntos
      const bounds = L.latLngBounds(straightLine);
      map.fitBounds(bounds, { padding: [50, 50] });
      return;
    }

    // Función para obtener ruta real de OSRM (solo si se solicita)
    const getRoute = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500); // Timeout muy corto
        
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Error al obtener la ruta');
        }

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates;
          const leafletCoords: [number, number][] = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRouteCoordinates(leafletCoords);

          if (leafletCoords.length > 0) {
            const bounds = L.latLngBounds(leafletCoords);
            map.fitBounds(bounds, { padding: [20, 20] });
          }
        }
      } catch (error) {
        console.log('Usando línea recta por timeout/error:', error);
        // Fallback inmediato: línea recta
        const straightLine: [number, number][] = [
          [start.lat, start.lng],
          [end.lat, end.lng]
        ];
        setRouteCoordinates(straightLine);

        const bounds = L.latLngBounds(straightLine);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    getRoute();
  }, [start, end, map, useRealRoute]);

  if (routeCoordinates.length === 0) {
    return null;
  }

  return (
    <Polyline
      positions={routeCoordinates}
      pathOptions={{
        color: color,
        weight: weight,
        opacity: opacity,
        dashArray: useRealRoute ? '10, 5' : '5, 10' // Diferente patrón para línea recta
      }}
    />
  );
};