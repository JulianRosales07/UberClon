import React, { useEffect, useState } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { generateRouteKey, getCachedRoute, setCachedRoute } from '../../utils/routeCache';
import { getOptimalRoute } from '../../utils/routeGenerator';

interface SimpleRouteProps {
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

export const SimpleRoute: React.FC<SimpleRouteProps> = ({
    start,
    end,
    color = '#2563eb',
    weight = 4,
    opacity = 0.8
}) => {
    const map = useMap();
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

    useEffect(() => {
        if (!start || !end) return;

        // Generar clave para caché
        const routeKey = generateRouteKey(start, end);
        
        // Verificar si ya tenemos esta ruta en caché
        const cachedRoute = getCachedRoute(routeKey);
        if (cachedRoute) {
            console.log('🚀 Usando ruta desde caché');
            setRouteCoordinates(cachedRoute.coordinates);
            
            // Ajustar vista del mapa
            if (cachedRoute.coordinates.length > 0) {
                const bounds = L.latLngBounds(cachedRoute.coordinates);
                map.fitBounds(bounds, { padding: [20, 20] });
            }
            return;
        }

        // Función para obtener ruta optimizada
        const getRoute = async () => {
            try {
                const routeCoords = await getOptimalRoute(start, end);
                
                // Guardar en caché
                setCachedRoute(routeKey, {
                    coordinates: routeCoords,
                    duration: 0,
                    distance: 0
                });
                
                setRouteCoordinates(routeCoords);

                // Ajustar vista del mapa para mostrar toda la ruta
                if (routeCoords.length > 0) {
                    // Usar setTimeout para asegurar que el mapa esté listo
                    setTimeout(() => {
                        try {
                            const bounds = L.latLngBounds(routeCoords);
                            map.fitBounds(bounds, { padding: [20, 20] });
                        } catch (mapError) {
                            console.log('Error ajustando vista del mapa:', mapError);
                        }
                    }, 100);
                }
            } catch (error) {
                console.error('Error obteniendo ruta:', error);
                // Fallback final: línea recta simple
                const fallbackRoute: [number, number][] = [
                    [start.lat, start.lng],
                    [end.lat, end.lng]
                ];
                setRouteCoordinates(fallbackRoute);
            }
        };

        getRoute();
    }, [start, end, map]);

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
                dashArray: '10, 5' // Línea punteada para mejor visibilidad
            }}
        />
    );
};