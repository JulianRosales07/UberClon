import React, { useState } from 'react';
import { useSimpleGeolocation } from '../../hooks/useSimpleGeolocation';

export const QuickLocationTest: React.FC = () => {
  const [showTest, setShowTest] = useState(false);
  
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
    timeout: 10000,

    maxRetries: 2
  });

  if (!showTest) {
    return (
      <button
        onClick={() => setShowTest(true)}
        className="fixed bottom-4 right-4 bg-purple-500 text-white p-3 rounded-full shadow-lg hover:bg-purple-600 transition-colors z-50"
        title="Probar ubicación rápida"
      >
        📍
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">🧪 Test GPS Rápido</h3>
        <button
          onClick={() => setShowTest(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Estado */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-3 h-3 rounded-full ${
            status === 'loading' ? 'bg-blue-500 animate-pulse' :
            status === 'success' ? 'bg-green-500' :
            status === 'error' ? 'bg-orange-500' :
            'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium">
            {status === 'loading' ? 'Detectando...' :
             status === 'success' ? 'Ubicación obtenida' :
             status === 'error' ? 'Ubicación aproximada' :
             'Error de ubicación'}
          </span>
          {retryCount > 0 && (
            <span className="text-xs text-gray-500">({retryCount + 1}/3)</span>
          )}
        </div>
      </div>

      {/* Información de ubicación */}
      {location && (
        <div className="mb-3 p-2 bg-green-50 rounded text-sm">
          <div className="font-medium text-green-800 mb-1">📍 Ubicación:</div>
          <div className="text-green-700">
            <div>Lat: {location.lat.toFixed(4)}</div>
            <div>Lng: {location.lng.toFixed(4)}</div>
            <div className="text-xs mt-1">{location.address}</div>
          </div>
          {accuracy && (
            <div className="text-xs text-green-600 mt-1">
              Precisión: {Math.round(accuracy)}m {accuracy < 100 ? '(GPS)' : '(Aproximada)'}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 rounded text-sm">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {/* Información del contexto */}
      <div className="mb-3 text-xs text-gray-600">
        <div>Contexto: {window.isSecureContext ? '✅ Seguro' : '❌ No seguro'}</div>
        <div>Navegador: {navigator.geolocation ? '✅ Compatible' : '❌ No compatible'}</div>
      </div>

      {/* Controles */}
      <div className="flex gap-2">
        <button
          onClick={retry}
          disabled={status === 'loading'}
          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {status === 'loading' ? '🔄' : '🔄 Reintentar'}
        </button>
        <button
          onClick={usePastoLocation}
          className="bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600"
          title="Establecer ubicación en Pasto manualmente"
        >
          🏛️ Pasto
        </button>
      </div>
    </div>
  );
};