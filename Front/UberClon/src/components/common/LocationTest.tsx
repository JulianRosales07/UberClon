import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useSimpleGeolocation } from '../../hooks/useSimpleGeolocation';

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
        width: 40px;
        height: 40px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
      ">
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const locationIcon = createCustomIcon('#10B981', '📍');

export const LocationTest: React.FC = () => {
  const {
    location,
    status,
    error,
    accuracy,
    retry,
    usePastoLocation,
    retryCount
  } = useSimpleGeolocation({
    enableHighAccuracy: true,
    timeout: 20000,
    maxRetries: 2
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-orange-500';
      case 'denied': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'loading': return 'Obteniendo ubicación...';
      case 'success': return 'Ubicación obtenida';
      case 'error': return 'Error de ubicación';
      case 'denied': return 'Permisos denegados';
      default: return 'Estado desconocido';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header con información */}
      <div className="bg-white p-4 border-b shadow-sm">
        <h2 className="text-xl font-bold mb-4">🧪 Prueba de Geolocalización</h2>
        
        {/* Estado actual */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
              <span className="font-medium">Estado</span>
            </div>
            <p className="text-sm text-gray-600">{getStatusText(status)}</p>
            {retryCount > 0 && (
              <p className="text-xs text-gray-500">Intento {retryCount + 1}</p>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">🔒 Contexto</span>
            </div>
            <p className="text-sm text-gray-600">
              {window.isSecureContext ? '✅ Seguro' : '❌ No seguro'}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">📍 Precisión</span>
            </div>
            <p className="text-sm text-gray-600">
              {accuracy ? `${Math.round(accuracy)}m` : 'N/A'}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">🌐 Método</span>
            </div>
            <p className="text-sm text-gray-600">
              {accuracy && accuracy < 100 ? 'GPS' : 'IP/Aproximado'}
            </p>
          </div>
        </div>

        {/* Información de ubicación */}
        {location && (
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <h3 className="font-medium text-green-800 mb-2">📍 Ubicación Detectada</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-green-700 font-medium">Latitud:</span>
                <span className="ml-2 font-mono">{location.lat.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-green-700 font-medium">Longitud:</span>
                <span className="ml-2 font-mono">{location.lng.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-green-700 font-medium">Dirección:</span>
                <span className="ml-2">{location.address}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 p-3 rounded-lg mb-4">
            <h3 className="font-medium text-red-800 mb-1">❌ Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-2">
          <button
            onClick={retry}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '🔄 Obteniendo...' : '🔄 Reintentar'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            🔄 Recargar Página
          </button>

          <button
            onClick={usePastoLocation}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            🏛️ Usar Pasto
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            ← Volver
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1">
        {location ? (
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={15}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <Marker position={[location.lat, location.lng]} icon={locationIcon}>
              <Popup>
                <div className="text-center">
                  <strong>📍 Tu Ubicación</strong><br />
                  <small>Lat: {location.lat.toFixed(6)}</small><br />
                  <small>Lng: {location.lng.toFixed(6)}</small><br />
                  {accuracy && (
                    <small>Precisión: {Math.round(accuracy)}m</small>
                  )}
                  <br />
                  <em>{location.address}</em>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {status === 'loading' ? '🔄' : '📍'}
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                {getStatusText(status)}
              </h3>
              {status === 'loading' && (
                <p className="text-gray-500">Esto puede tomar unos segundos...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};