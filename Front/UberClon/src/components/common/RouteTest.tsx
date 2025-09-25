import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { generateManhattanRoute, generateRealisticRoute } from '../../utils/routeGenerator';
import { RealStreetRoute } from './RealStreetRoute';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

export const RouteTest: React.FC = () => {
  const [routeType, setRouteType] = useState<'manhattan' | 'realistic'>('manhattan');
  
  // Puntos de prueba en Pasto
  const start = { lat: 1.2105179, lng: -77.2749852 };
  const end = { lat: 1.2163093, lng: -77.2884871 };
  
  const manhattanRoute = generateManhattanRoute(start, end);
  const realisticRoute = generateRealisticRoute(start, end);
  
  const currentRoute = routeType === 'manhattan' ? manhattanRoute : realisticRoute;

  return (
    <div className="h-screen flex flex-col">
      {/* Controles */}
      <div className="bg-white p-4 border-b">
        <h2 className="text-lg font-bold mb-2">Prueba de Rutas</h2>
        <div className="flex gap-4">
          <div className="bg-blue-100 p-3 rounded">
            <strong className="text-blue-800">🗺️ Ruta Real de Calles (OSRM)</strong>
            <p className="text-sm text-blue-600">Línea azul sólida - Sigue las calles reales</p>
          </div>
          <button
            onClick={() => setRouteType('manhattan')}
            className={`px-4 py-2 rounded ${
              routeType === 'manhattan' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Comparar: Manhattan ({manhattanRoute.length} puntos)
          </button>
          <button
            onClick={() => setRouteType('realistic')}
            className={`px-4 py-2 rounded ${
              routeType === 'realistic' 
                ? 'bg-teal-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Comparar: Realista ({realisticRoute.length} puntos)
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1">
        <MapContainer
          center={[start.lat, start.lng]}
          zoom={14}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Ruta Real de Calles */}
          <RealStreetRoute
            start={start}
            end={end}
            color="#2563eb"
            weight={5}
            opacity={0.8}
          />

          {/* Ruta de comparación (opcional) */}
          <Polyline
            positions={currentRoute}
            pathOptions={{
              color: routeType === 'manhattan' ? '#FF6B6B' : '#4ECDC4',
              weight: 2,
              opacity: 0.5,
              dashArray: '10, 5'
            }}
          />

          {/* Marcadores */}
          <Marker position={[start.lat, start.lng]} icon={pickupIcon}>
            <Popup>
              <div>
                <strong>🟢 Origen</strong><br />
                Lat: {start.lat}<br />
                Lng: {start.lng}
              </div>
            </Popup>
          </Marker>

          <Marker position={[end.lat, end.lng]} icon={destinationIcon}>
            <Popup>
              <div>
                <strong>🔴 Destino</strong><br />
                Lat: {end.lat}<br />
                Lng: {end.lng}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};