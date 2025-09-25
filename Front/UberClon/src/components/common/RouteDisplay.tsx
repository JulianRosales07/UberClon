import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

interface RouteDisplayProps {
  start: {
    lat: number;
    lng: number;
  };
  end: {
    lat: number;
    lng: number;
  };
  color?: string;
  showInstructions?: boolean;
}

export const RouteDisplay: React.FC<RouteDisplayProps> = ({
  start,
  end,
  color = '#2563eb',
  showInstructions = false
}) => {
  const map = useMap();

  useEffect(() => {
    if (!start || !end || !map) return;

    // Crear el control de ruta
    const routingControl = (L as any).Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: () => null, // No crear marcadores automáticos
      lineOptions: {
        styles: [
          {
            color: color,
            weight: 6,
            opacity: 0.8
          }
        ]
      },
      show: showInstructions,
      collapsible: showInstructions,
      router: (L as any).Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      })
    });

    // Agregar al mapa
    routingControl.addTo(map);

    // Ajustar vista para mostrar toda la ruta
    routingControl.on('routesfound', function(e: any) {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        map.fitBounds(route.bounds, { padding: [20, 20] });
      }
    });

    // Cleanup
    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [start, end, color, showInstructions, map]);

  return null;
};