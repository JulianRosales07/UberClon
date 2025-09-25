import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useSimpleGeolocation } from '../../hooks/useSimpleGeolocation';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationInfo {
  method: string;
  lat: number;
  lng: number;
  accuracy?: number;
  address: string;
  timestamp: number;
}

const LocationDiagnostic: React.FC = () => {
  const [locationHistory, setLocationHistory] = useState<LocationInfo[]>([]);
  const [manualLocation, setManualLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isTestingGPS, setIsTestingGPS] = useState(false);
  const [currentView, setCurrentView] = useState<{lat: number, lng: number}>({
    lat: 1.2136, // Pasto
    lng: -77.2811
  });

  const { location, status, error, accuracy, retry, setManualLocation: setHookLocation, usePastoLocation } = useSimpleGeolocation({
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0,
    maxRetries: 1
  });

  // Agregar ubicación al historial cuando cambie
  useEffect(() => {
    if (location) {
      const newLocation: LocationInfo = {
        method: accuracy ? 'GPS' : 'Fallback',
        lat: location.lat,
        lng: location.lng,
        accuracy: accuracy || undefined,
        address: location.address || 'Sin dirección',
        timestamp: Date.now()
      };
      
      setLocationHistory(prev => [newLocation, ...prev.slice(0, 9)]); // Mantener últimas 10
    }
  }, [location, accuracy]);

  // Función para probar GPS nativo del navegador
  const testNativeGPS = async () => {
    setIsTestingGPS(true);
    
    try {
      console.log('🧪 Probando GPS nativo del navegador...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
          }
        );
      });

      const nativeLocation: LocationInfo = {
        method: 'GPS Nativo',
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        address: `GPS Nativo (±${Math.round(position.coords.accuracy)}m)`,
        timestamp: Date.now()
      };

      setLocationHistory(prev => [nativeLocation, ...prev.slice(0, 9)]);
      setCurrentView({ lat: position.coords.latitude, lng: position.coords.longitude });
      
    } catch (error: any) {
      console.error('❌ Error GPS nativo:', error);
      const errorLocation: LocationInfo = {
        method: 'GPS Nativo Error',
        lat: 0,
        lng: 0,
        address: `Error: ${error.message}`,
        timestamp: Date.now()
      };
      setLocationHistory(prev => [errorLocation, ...prev.slice(0, 9)]);
    } finally {
      setIsTestingGPS(false);
    }
  };

  // Función para usar ubicación de Pasto directamente
  const usePastoDirectly = () => {
    usePastoLocation();
    const pastoLocation: LocationInfo = {
      method: 'Pasto Directo',
      lat: 1.2136,
      lng: -77.2811,
      address: 'Centro de Pasto, Nariño (directo)',
      timestamp: Date.now()
    };
    setLocationHistory(prev => [pastoLocation, ...prev.slice(0, 9)]);
    setCurrentView({ lat: 1.2136, lng: -77.2811 });
  };

  // Componente para manejar clics en el mapa
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        const manualLoc = { lat, lng };
        setManualLocation(manualLoc);
        
        const manualLocationInfo: LocationInfo = {
          method: 'Manual',
          lat,
          lng,
          address: `Ubicación manual: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          timestamp: Date.now()
        };
        
        setLocationHistory(prev => [manualLocationInfo, ...prev.slice(0, 9)]);
        
        // Establecer en el hook también
        setHookLocation({
          lat,
          lng,
          address: `Ubicación manual: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      }
    });
    return null;
  };

  // Ubicaciones predefinidas de Pasto
  const pastoLocations = [
    { name: 'Centro de Pasto', lat: 1.2136, lng: -77.2811 },
    { name: 'Universidad de Nariño', lat: 1.2174, lng: -77.2806 },
    { name: 'Aeropuerto Antonio Nariño', lat: 1.4028, lng: -77.2914 },
    { name: 'Plaza de Nariño', lat: 1.2133, lng: -77.2814 },
    { name: 'Unicentro Pasto', lat: 1.2089, lng: -77.2769 }
  ];

  const setToPastoLocation = (location: {name: string, lat: number, lng: number}) => {
    const pastoLocationInfo: LocationInfo = {
      method: 'Pasto Predefinido',
      lat: location.lat,
      lng: location.lng,
      address: location.name,
      timestamp: Date.now()
    };
    
    setLocationHistory(prev => [pastoLocationInfo, ...prev.slice(0, 9)]);
    setCurrentView({ lat: location.lat, lng: location.lng });
    setManualLocation({ lat: location.lat, lng: location.lng });
    
    // Establecer en el hook también
    setHookLocation({
      lat: location.lat,
      lng: location.lng,
      address: location.name
    });
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧭 Diagnóstico de Ubicación</h1>
      
      {/* Panel de control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Estado actual */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">📍 Estado Actual</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Estado:</strong> {status}</div>
            {location && (
              <>
                <div><strong>Coordenadas:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</div>
                <div><strong>Dirección:</strong> {location.address}</div>
                {accuracy && <div><strong>Precisión:</strong> ±{Math.round(accuracy)}m</div>}
              </>
            )}
            {error && <div className="text-red-600"><strong>Error:</strong> {error}</div>}
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">🎮 Controles</h2>
          <div className="space-y-2">
            <button
              onClick={retry}
              className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
            >
              🔄 Reintentar Ubicación
            </button>
            <button
              onClick={testNativeGPS}
              disabled={isTestingGPS}
              className="w-full bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isTestingGPS ? '⏳ Probando...' : '🛰️ Probar GPS Nativo'}
            </button>
            <button
              onClick={usePastoDirectly}
              className="w-full bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
            >
              🏛️ Usar Pasto Directamente
            </button>
          </div>
        </div>
      </div>

      {/* Ubicaciones predefinidas de Pasto */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">🏛️ Ubicaciones de Pasto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {pastoLocations.map((loc, index) => (
            <button
              key={index}
              onClick={() => setToPastoLocation(loc)}
              className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 text-sm"
            >
              📍 {loc.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Haz clic en cualquier ubicación para establecerla como tu posición actual
        </p>
      </div>

      {/* Mapa */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">🗺️ Mapa Interactivo</h2>
        <p className="text-sm text-gray-600 mb-2">
          Haz clic en el mapa para establecer tu ubicación manualmente
        </p>
        <div className="h-96 rounded-lg overflow-hidden">
          <MapContainer
            center={[currentView.lat, currentView.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            key={`${currentView.lat}-${currentView.lng}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            
            {/* Marcador de ubicación actual */}
            {location && (
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  <div>
                    <strong>Ubicación Actual</strong><br />
                    {location.address}<br />
                    {accuracy && `Precisión: ±${Math.round(accuracy)}m`}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Marcador manual */}
            {manualLocation && (
              <Marker position={[manualLocation.lat, manualLocation.lng]}>
                <Popup>
                  <div>
                    <strong>Ubicación Manual</strong><br />
                    {manualLocation.lat.toFixed(6)}, {manualLocation.lng.toFixed(6)}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>

      {/* Historial de ubicaciones */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">📋 Historial de Ubicaciones</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {locationHistory.map((loc, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{loc.method}</div>
                  <div className="text-sm text-gray-600">{loc.address}</div>
                  <div className="text-xs text-gray-500">
                    {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                    {loc.accuracy && ` (±${Math.round(loc.accuracy)}m)`}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(loc.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {locationHistory.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No hay ubicaciones en el historial
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDiagnostic;