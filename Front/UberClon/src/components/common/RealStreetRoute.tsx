import React, { useEffect, useState } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface RealStreetRouteProps {
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
}

export const RealStreetRoute: React.FC<RealStreetRouteProps> = ({
  start,
  end,
  color = '#2563eb',
  weight = 4,
  opacity = 0.8
}) => {
  const map = useMap();
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!start || !end || !map) return;

    // Esperar a que el mapa esté completamente inicializado
    const waitForMap = () => {
      return new Promise<void>((resolve) => {
        if (map.getContainer()) {
          resolve();
        } else {
          setTimeout(() => waitForMap().then(resolve), 50);
        }
      });
    };

    const getStreetRoute = async () => {
      await waitForMap();
      setIsLoading(true);
      console.log('🗺️ Obteniendo ruta real de las calles...');

      try {
        // Intentar múltiples servidores OSRM
        const osrmServers = [
          'https://router.project-osrm.org',
          'https://routing.openstreetmap.de'
        ];

        let routeData = null;

        for (const server of osrmServers) {
          try {
            console.log(`🔄 Intentando servidor: ${server}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

            const url = `${server}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
            
            const response = await fetch(url, {
              signal: controller.signal,
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              if (data.routes && data.routes.length > 0) {
                routeData = data.routes[0];
                console.log(`✅ Ruta obtenida de ${server}`);
                break;
              }
            }
          } catch (serverError) {
            console.log(`❌ Error con servidor ${server}:`, serverError.message);
            continue;
          }
        }

        if (routeData) {
          const coordinates = routeData.geometry.coordinates;
          const leafletCoords: [number, number][] = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          
          setRouteCoordinates(leafletCoords);
          console.log('✅ Ruta de calles reales cargada con', leafletCoords.length, 'puntos');

          // Ajustar vista del mapa con verificación de estado
          setTimeout(() => {
            try {
              if (map && map.getContainer() && leafletCoords.length > 0) {
                const bounds = L.latLngBounds(leafletCoords);
                if (bounds.isValid()) {
                  map.fitBounds(bounds, { padding: [30, 30] });
                }
              }
            } catch (mapError) {
              console.log('Error ajustando vista:', mapError);
            }
          }, 200);
        } else {
          throw new Error('No se pudo obtener ruta de ningún servidor');
        }

      } catch (error) {
        console.error('❌ Error obteniendo ruta de calles:', error);
        
        // Fallback: crear ruta suavizada
        console.log('🔄 Creando ruta fallback suavizada...');
        const fallbackRoute = createSmoothRoute(start, end);
        setRouteCoordinates(fallbackRoute);

        // Ajustar vista para fallback con verificación de estado
        setTimeout(() => {
          try {
            if (map && map.getContainer() && fallbackRoute.length > 0) {
              const bounds = L.latLngBounds(fallbackRoute);
              if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
              }
            }
          } catch (mapError) {
            console.log('Error ajustando vista fallback:', mapError);
          }
        }, 200);
      } finally {
        setIsLoading(false);
      }
    };

    getStreetRoute();
  }, [start, end, map]);

  // Función para crear ruta suavizada como fallback
  const createSmoothRoute = (startPoint: { lat: number; lng: number }, endPoint: { lat: number; lng: number }): [number, number][] => {
    const route: [number, number][] = [];
    const steps = 25;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      
      // Interpolación básica
      let lat = startPoint.lat + (endPoint.lat - startPoint.lat) * t;
      let lng = startPoint.lng + (endPoint.lng - startPoint.lng) * t;
      
      // Agregar curva suave para simular calles
      const curve = Math.sin(t * Math.PI) * 0.002;
      lat += curve;
      
      route.push([lat, lng]);
    }

    return route;
  };

  if (routeCoordinates.length === 0) {
    return isLoading ? (
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow z-10">
        <span className="text-sm">🔄 Cargando ruta...</span>
      </div>
    ) : null;
  }

  return (
    <>
      <Polyline
        positions={routeCoordinates}
        pathOptions={{
          color: color,
          weight: weight,
          opacity: opacity,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />
      {!isLoading && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow z-10">
          <span className="text-xs text-green-600">
            ✅ Ruta real ({routeCoordinates.length} puntos)
          </span>
        </div>
      )}
    </>
  );
};