/**
 * Componente principal de la aplicación Uber Clone
 * Integra geolocalización, mapas y solicitudes de viaje
 * Diseño responsive optimizado para móvil, tablet y desktop
 */

import React, { useState, useEffect } from 'react';
import { DriverMap } from '../driver/DriverMap';
import TripRequestWithMap from '../trip/TripRequestWithMap';
import { useGeolocation } from '../../hooks/useGeolocation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'passenger' | 'driver';
  token: string;
}

interface Trip {
  id: string;
  passenger: {
    name: string;
    phone: string;
  };
  origin: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedPrice: number;
  estimatedDistance: number;
  status: string;
}

interface UberAppProps {
  user?: User;
  onLogin?: () => void;
  onLogout?: () => void;
}

const UberApp: React.FC<UberAppProps> = ({ user, onLogin, onLogout }) => {
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [tripRequests, setTripRequests] = useState<Trip[]>([]);
  const [appMode, setAppMode] = useState<'map' | 'request'>('request');
  const [notifications, setNotifications] = useState<string[]>([]);

  // Hook de geolocalización para la app
  const {
    location: currentLocation,
    error: locationError,
    isLoading: isLoadingLocation,
    getCurrentLocation,
    startWatching,
    stopWatching,
    isWatching
  } = useGeolocation({
    enableHighAccuracy: true,
    watch: user?.role === 'driver', // Los conductores necesitan seguimiento continuo
    onLocationUpdate: (location) => {
      console.log('Ubicación actualizada:', location);
    },
    onLocationError: (error) => {
      addNotification(`Error de ubicación: ${error.message}`);
    }
  });

  /**
   * Agregar notificación
   */
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  /**
   * Manejar solicitud de viaje
   */
  const handleTripRequest = async (tripData: any) => {
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {})
        },
        body: JSON.stringify(tripData)
      });

      const data = await response.json();
      
      if (data.success) {
        addNotification('¡Viaje solicitado exitosamente! Buscando conductor...');
        setActiveTrip(data.data);
        setAppMode('map');
      } else {
        addNotification(`Error: ${data.error}`);
      }
    } catch (error) {
      addNotification('Error conectando con el servidor');
    }
  };

  /**
   * Manejar aceptación de viaje (conductores)
   */
  const handleTripAccept = async (tripId: string) => {
    if (!user?.token) return;

    try {
      const response = await fetch(`/api/trips/${tripId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        addNotification('¡Viaje aceptado exitosamente!');
        setActiveTrip(data.data);
        setTripRequests(prev => prev.filter(trip => trip.id !== tripId));
      } else {
        addNotification(`Error: ${data.error}`);
      }
    } catch (error) {
      addNotification('Error aceptando el viaje');
    }
  };

  /**
   * Obtener solicitudes de viaje disponibles (conductores)
   */
  const fetchAvailableTrips = async () => {
    if (!user?.token || user.role !== 'driver' || !currentLocation) return;

    try {
      const response = await fetch(
        `/api/trips/driver/available?lat=${currentLocation.coordinates.lat}&lng=${currentLocation.coordinates.lng}`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setTripRequests(data.data);
      }
    } catch (error) {
      console.error('Error obteniendo viajes disponibles:', error);
    }
  };

  // Efectos
  useEffect(() => {
    if (user?.role === 'driver' && currentLocation) {
      fetchAvailableTrips();
      
      // Actualizar cada 30 segundos
      const interval = setInterval(fetchAvailableTrips, 30000);
      return () => clearInterval(interval);
    }
  }, [user, currentLocation]);

  // Renderizado condicional basado en el usuario
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🚗 Uber Clone</h1>
          <p className="text-gray-600 mb-6">Inicia sesión para continuar</p>
          <button
            onClick={onLogin}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header Responsive */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg sm:text-xl font-bold">U</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Uber Clone</h1>
            </div>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">
            {user.role === 'driver' ? '🚗 Conductor' : '👤 Pasajero'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user.role === 'passenger' && (
            <div className="flex space-x-1 sm:space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setAppMode('request')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  appMode === 'request' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="hidden sm:inline">Solicitar</span>
                <span className="sm:hidden">📍</span>
              </button>
              <button
                onClick={() => setAppMode('map')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  appMode === 'map' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="hidden sm:inline">Mapa</span>
                <span className="sm:hidden">🗺️</span>
              </button>
            </div>
          )}
          
          <div className="hidden md:block text-sm text-gray-600">
            Hola, {user.name}
          </div>
          
          <button
            onClick={onLogout}
            className="text-red-600 hover:text-red-700 text-sm p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <span className="hidden sm:inline">Salir</span>
            <span className="sm:hidden">🚪</span>
          </button>
        </div>
      </header>

      {/* Notificaciones Responsive */}
      {notifications.length > 0 && (
        <div className="fixed top-16 sm:top-20 left-2 right-2 sm:left-4 sm:right-4 lg:left-6 lg:right-6 z-50 space-y-2 max-w-md mx-auto">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl shadow-lg animate-slide-down backdrop-blur-sm border border-blue-400/20"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{notification}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1">
        {user.role === 'passenger' ? (
          // Vista de pasajero
          appMode === 'request' ? (
            <TripRequestWithMap
              onTripRequest={handleTripRequest}
              authToken={user.token}
            />
          ) : (
            <DriverMap
              center={currentLocation?.coordinates}
              driverLocation={currentLocation?.coordinates}
              activeTrip={activeTrip || undefined}
              authToken={user.token}
              onLocationUpdate={(location) => {
                console.log('Ubicación actualizada:', location);
              }}
            />
          )
        ) : (
          // Vista de conductor
          <DriverMap
            center={currentLocation?.coordinates}
            driverLocation={currentLocation?.coordinates}
            tripRequests={tripRequests}
            activeTrip={activeTrip || undefined}
            authToken={user.token}
            onLocationUpdate={(location) => {
              console.log('Ubicación del conductor actualizada:', location);
            }}
            onTripAccept={handleTripAccept}
          />
        )}
      </div>

      {/* Panel de estado para conductores - Responsive */}
      {user.role === 'driver' && (
        <div className="bg-white border-t border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isWatching ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isWatching ? '🟢 En línea' : '🔴 Desconectado'}
              </span>
              {isWatching && (
                <span className="hidden sm:inline text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Buscando viajes
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                  📋 {tripRequests.length} solicitud{tripRequests.length !== 1 ? 'es' : ''}
                </span>
                
                {activeTrip && (
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-lg font-medium">
                    🚗 Viaje activo
                  </span>
                )}
              </div>
              
              {currentLocation && (
                <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                  📍 {currentLocation.coordinates.lat.toFixed(4)}, {currentLocation.coordinates.lng.toFixed(4)}
                </span>
              )}
            </div>
          </div>
          
          {locationError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-sm text-red-700">{locationError.message}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estilos CSS */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UberApp;