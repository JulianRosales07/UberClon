/**
 * Componente de solicitud de viaje con mapa integrado
 */

import React, { useState, useEffect } from 'react';
import { DriverMap } from '../driver/DriverMap';
import { useGeolocation } from '../../hooks/useGeolocation';
import GeolocationService from '../../services/GeolocationService';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface TripEstimate {
  route: {
    distance: number;
    duration: number;
  };
  pricing: {
    estimatedPrice: number;
    currency: string;
  };
  formatted: {
    distance: string;
    duration: string;
    price: string;
  };
}

interface TripRequestWithMapProps {
  onTripRequest: (tripData: any) => void;
  authToken?: string;
}

const TripRequestWithMap: React.FC<TripRequestWithMapProps> = ({
  onTripRequest,
  authToken
}) => {
  // Estados principales
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [tripEstimate, setTripEstimate] = useState<TripEstimate | null>(null);
  const [tripType, setTripType] = useState<'standard' | 'premium' | 'shared'>('standard');
  
  // Estados de UI
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isRequestingTrip, setIsRequestingTrip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDestinationInput, setShowDestinationInput] = useState(false);
  
  // Estados de autocompletado
  const [destinationInput, setDestinationInput] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const geolocationService = new GeolocationService();
  if (authToken) {
    geolocationService.setAuthToken(authToken);
  }

  // Hook de geolocalización
  const {
    error: locationError,
    isLoading: isLoadingLocation,
    getCurrentLocation
  } = useGeolocation({
    autoStart: true,
    usePastoLocation: true, // Usar ubicación de Pasto siempre
    onLocationUpdate: (location) => {
      if (!origin) {
        setOrigin({
          lat: location.coordinates.lat,
          lng: location.coordinates.lng,
          address: location.address || 'Centro de Pasto, Nariño'
        });
      }
    }
  });

  // Inicializar con ubicación por defecto si no hay origen después de un tiempo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!origin && !isLoadingLocation) {
        // Ubicación por defecto (Ubicación Actual de Referencia)
        const defaultLocation: Location = {
          lat: 1.223789,
          lng: -77.283255,
          address: 'Centro de Pasto, Nariño'
        };
        setOrigin(defaultLocation);
      }
    }, 3000); // Esperar 3 segundos antes de usar ubicación por defecto

    return () => clearTimeout(timer);
  }, [origin, isLoadingLocation]);

  /**
   * Buscar sugerencias de destino
   */
  const searchDestinationSuggestions = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const results = await geolocationService.getAutocompleteSuggestions(input);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error buscando sugerencias:', error);
    }
  };

  /**
   * Seleccionar destino
   */
  const selectDestination = (suggestion: any) => {
    const destinationLocation: Location = {
      lat: suggestion.coordinates.lat,
      lng: suggestion.coordinates.lng,
      address: suggestion.text
    };

    setDestination(destinationLocation);
    setDestinationInput(suggestion.text);
    setShowSuggestions(false);
  };

  /**
   * Calcular estimación de viaje
   */
  const calculateTripEstimate = async () => {
    if (!origin || !destination) return;

    setIsCalculatingRoute(true);
    setError(null);

    try {
      const estimate = await geolocationService.getTripEstimate(
        origin,
        destination,
        tripType
      );

      setTripEstimate(estimate);
    } catch (error: any) {
      setError('Error calculando la ruta. Intenta de nuevo.');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  /**
   * Solicitar viaje
   */
  const requestTrip = async () => {
    if (!origin || !destination || !tripEstimate) return;

    setIsRequestingTrip(true);
    setError(null);

    try {
      const tripData = {
        origin: {
          address: origin.address,
          coordinates: origin
        },
        destination: {
          address: destination.address,
          coordinates: destination
        },
        tripType,
        estimatedPrice: tripEstimate.pricing.estimatedPrice,
        estimatedDistance: tripEstimate.route.distance / 1000,
        estimatedDuration: Math.round(tripEstimate.route.duration / 60),
        paymentMethod: 'card'
      };

      await onTripRequest(tripData);
    } catch (error: any) {
      setError('Error solicitando el viaje. Intenta de nuevo.');
    } finally {
      setIsRequestingTrip(false);
    }
  };

  /**
   * Usar ubicación actual como origen
   */
  const useCurrentLocationAsOrigin = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setOrigin({
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        address: location.address || 'Tu ubicación actual'
      });
    }
  };

  // Efectos
  useEffect(() => {
    if (origin && destination) {
      calculateTripEstimate();
    } else {
      setTripEstimate(null);
    }
  }, [origin, destination, tripType]);

  // Debounce para autocompletado
  useEffect(() => {
    const timer = setTimeout(() => {
      if (destinationInput && !destination) {
        searchDestinationSuggestions(destinationInput);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [destinationInput]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mapa */}
      <div className="flex-1 relative">
        {origin ? (
          <>

            <DriverMap
              center={origin}
              zoom={14}
              pickup={origin}
              destination={destination || undefined}
            />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Obteniendo ubicación...</p>
            </div>
          </div>
        )}
        
        {/* Overlay de destino en el mapa */}
        {!showDestinationInput && origin && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <div className="bg-white rounded-full p-4 shadow-lg border-4 border-blue-500">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
            <p className="text-center mt-2 text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded">
              ¿A dónde vamos?
            </p>
          </div>
        )}
      </div>

      {/* Panel inferior */}
      <div className="bg-white border-t border-gray-200 p-3 space-y-3">
        {/* Mensajes de error */}
        {(error || locationError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">
              {error || locationError || 'Error de ubicación'}
            </p>
          </div>
        )}

        {/* Información de origen */}
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="flex-1">
            {origin ? (
              <p className="text-sm text-gray-700">{origin.address}</p>
            ) : (
              <button
                onClick={useCurrentLocationAsOrigin}
                disabled={isLoadingLocation}
                className="text-blue-500 text-sm font-medium"
              >
                {isLoadingLocation ? 'Obteniendo ubicación...' : '📍 Usar mi ubicación actual'}
              </button>
            )}
          </div>
        </div>

        {/* Input de destino */}
        {(showDestinationInput || origin) && (
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    setDestination(null);
                  }}
                  onFocus={() => setShowDestinationInput(true)}
                  placeholder="¿A dónde vas?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sugerencias */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectDestination(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{suggestion.main_text}</div>
                    <div className="text-sm text-gray-500">{suggestion.secondary_text}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Estimación del viaje */}
        {tripEstimate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-gray-900 text-sm">Estimación del viaje</h3>
              <span className="text-base font-bold text-blue-600">
                {tripEstimate.formatted.price}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>{tripEstimate.formatted.distance}</span>
              <span>{tripEstimate.formatted.duration}</span>
            </div>
          </div>
        )}

        {/* Tipos de viaje */}
        {destination && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 text-sm">Tipo de viaje</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'standard', name: 'Estándar', icon: '🚗', desc: 'Económico' },
                { type: 'premium', name: 'Premium', icon: '🚙', desc: 'Cómodo' },
                { type: 'shared', name: 'Compartido', icon: '🚐', desc: 'Ahorra' }
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => setTripType(option.type as any)}
                  className={`p-2 rounded-lg border-2 text-center ${
                    tripType === option.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-xl mb-1">{option.icon}</div>
                  <div className="font-medium text-xs">{option.name}</div>
                  <div className="text-xs text-gray-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón de solicitar viaje */}
        {tripEstimate && (
          <button
            onClick={requestTrip}
            disabled={isRequestingTrip || isCalculatingRoute}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium text-base"
          >
            {isRequestingTrip ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Solicitando viaje...
              </>
            ) : isCalculatingRoute ? (
              'Calculando ruta...'
            ) : (
              `Solicitar viaje - ${tripEstimate.formatted.price}`
            )}
          </button>
        )}

        {/* Botón para mostrar input de destino */}
        {!showDestinationInput && !destination && origin && (
          <button
            onClick={() => setShowDestinationInput(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium text-base"
          >
            ¿A dónde vamos?
          </button>
        )}
      </div>
    </div>
  );
};

export default TripRequestWithMap;