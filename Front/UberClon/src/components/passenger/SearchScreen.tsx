import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, MapPin, Star, Plus, UserCheck, Search, Loader2, Navigation } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface ApiLocation {
  lat: number;
  lng: number;
  address?: string;
  place_id?: string;
  display_name?: string;
  type?: string;
  importance?: number;
}

interface SearchScreenProps {
  onBack: () => void;
  onLocationSelect: (pickup: Location, destination: Location) => void;
  currentLocation?: Location | null;
}

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  distance: string;
  type: 'recent' | 'saved' | 'search';
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onBack,
  onLocationSelect,
  currentLocation
}) => {
  const { logout } = useAppStore();
  const [pickupInput, setPickupInput] = useState(currentLocation?.address || 'Centro de Pasto, Nariño');
  const [destinationInput, setDestinationInput] = useState('');
  const [activeInput, setActiveInput] = useState<'pickup' | 'destination'>('destination');
  const [tripType, setTripType] = useState<'now' | 'later'>('now');
  const [forWho, setForWho] = useState<'me' | 'someone'>('me');
  const [searchResults, setSearchResults] = useState<ApiLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultSuggestions: LocationSuggestion[] = [
    {
      id: '1',
      name: 'Unicentro',
      address: 'Centro Comercial Unicentro',
      distance: '1.6 km',
      type: 'recent'
    },
    {
      id: '2',
      name: 'Avenida de los Estudiantes',
      address: 'Avenida de los Estudiantes',
      distance: '750 m',
      type: 'recent'
    },
    {
      id: '3',
      name: 'Universidad Mariana',
      address: 'Universidad Mariana',
      distance: '150 m',
      type: 'recent'
    },
    {
      id: '4',
      name: 'Único',
      address: 'Centro Comercial Único',
      distance: '4.1 km',
      type: 'recent'
    },
    {
      id: '5',
      name: 'Tamasagra',
      address: 'Tamasagra',
      distance: '3.1 km',
      type: 'recent'
    },
    {
      id: '6',
      name: 'Estadio Libertad',
      address: 'Estadio Libertad',
      distance: '4.2 km',
      type: 'recent'
    },
    {
      id: '7',
      name: 'Parque Infantil',
      address: 'Parque Infantil',
      distance: '750 m',
      type: 'recent'
    },
    {
      id: '8',
      name: 'Alvernia',
      address: 'Alvernia',
      distance: '2.4 km',
      type: 'recent'
    }
  ];

  // Función para buscar ubicaciones usando la API real
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Usar API real de geolocalización
      const response = await fetch(`${import.meta.env.VITE_API_URL}/locations-test/search?query=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      
      if (data.success && data.data) {
        // Convertir formato de API a formato local
        const results = data.data.map((location: any) => ({
          lat: location.lat,
          lng: location.lon,
          address: location.display_name,
          place_id: location.place_id,
          display_name: location.display_name,
          type: location.type,
          importance: location.importance
        }));
        setSearchResults(results);
      } else {
        // Fallback a servicio simplificado si la API falla
        const { searchLocationsSimple } = await import('../../services/locationServiceSimple');
        const results = await searchLocationsSimple(query, 8);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error buscando ubicaciones:', error);
      // Fallback a servicio simplificado
      try {
        const { searchLocationsSimple } = await import('../../services/locationServiceSimple');
        const results = await searchLocationsSimple(query, 8);
        setSearchResults(results);
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Efecto para buscar cuando cambia el query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    // Mapear las ubicaciones con sus coordenadas exactas
    const locationCoordinates: Record<string, { lat: number; lng: number }> = {
      'Unicentro': { lat: 1.216386, lng: -77.288671 },
      'Avenida de los Estudiantes': { lat: 1.226829, lng: -77.282465 },
      'Universidad Mariana': { lat: 1.223802, lng: -77.283742 },
      'Único': { lat: 1.205879, lng: -77.260628 },
      'Tamasagra': { lat: 1.204400, lng: -77.293005 },
      'Estadio Libertad': { lat: 1.198087, lng: -77.278660 },
      'Parque Infantil': { lat: 1.218915, lng: -77.281944 },
      'Alvernia': { lat: 1.220019, lng: -77.298537 }
    };

    const coords = locationCoordinates[suggestion.name] || { lat: 1.223789, lng: -77.283255 };
    
    const location: Location = {
      lat: coords.lat,
      lng: coords.lng,
      address: suggestion.address
    };

    if (activeInput === 'destination') {
      setDestinationInput(suggestion.name);
      // Simular selección automática cuando se elige destino
      const pickup: Location = {
        lat: 1.223789, // Centro de Pasto
        lng: -77.283255,
        address: pickupInput
      };
      onLocationSelect(pickup, location);
    } else {
      setPickupInput(suggestion.name);
      setActiveInput('destination');
    }
  };

  const handleLocationResultClick = (location: ApiLocation) => {
    const selectedLocation: Location = {
      lat: location.lat,
      lng: location.lng,
      address: location.address || location.display_name || 'Ubicación seleccionada'
    };

    if (activeInput === 'destination') {
      setDestinationInput(selectedLocation.address || '');
      
      // Crear ubicación de origen desde el input actual
      let pickup: Location;
      if (currentLocation && pickupInput === currentLocation.address) {
        // Si el pickup es la ubicación actual, usar esas coordenadas
        pickup = currentLocation;
      } else {
        // Si es una ubicación personalizada, usar coordenadas por defecto o buscar
        pickup = {
          lat: currentLocation?.lat || 1.223789,
          lng: currentLocation?.lng || -77.283255,
          address: pickupInput
        };
      }
      
      onLocationSelect(pickup, selectedLocation);
    } else {
      // Seleccionando origen
      setPickupInput(selectedLocation.address || '');
      setActiveInput('destination');
    }
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDriverLogin = () => {
    logout(); // Cerrar sesión actual y volver a la página de inicio
  };

  // Función para usar la ubicación actual
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Usar geocodificación inversa para obtener la dirección
            const response = await fetch(`${import.meta.env.VITE_API_URL}/locations-test/details/${position.coords.latitude}/${position.coords.longitude}`);
            const data = await response.json();
            
            const currentLoc: Location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: data.success ? data.data.display_name : 'Tu ubicación actual'
            };

            if (activeInput === 'pickup') {
              setPickupInput(currentLoc.address || 'Tu ubicación actual');
              setActiveInput('destination');
            } else {
              setDestinationInput(currentLoc.address || 'Tu ubicación actual');
              // Si tenemos origen y destino, proceder
              const pickup: Location = {
                lat: currentLocation?.lat || 1.223789,
                lng: currentLocation?.lng || -77.283255,
                address: pickupInput
              };
              onLocationSelect(pickup, currentLoc);
            }
          } catch (error) {
            console.error('Error obteniendo ubicación:', error);
            // Fallback sin geocodificación inversa
            if (activeInput === 'pickup') {
              setPickupInput('Tu ubicación actual');
              setActiveInput('destination');
            } else {
              setDestinationInput('Tu ubicación actual');
            }
          } finally {
            setIsSearching(false);
          }
        },
        (error) => {
          console.error('Error de geolocalización:', error);
          setIsSearching(false);
          // Fallback a Pasto
          const pastoLocation: Location = {
            lat: 1.223789,
            lng: -77.283255,
            address: 'Centro de Pasto, Nariño'
          };

          if (activeInput === 'pickup') {
            setPickupInput(pastoLocation.address || 'Centro de Pasto, Nariño');
            setActiveInput('destination');
          } else {
            setDestinationInput(pastoLocation.address || 'Centro de Pasto, Nariño');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      // Fallback si no hay geolocalización
      const pastoLocation: Location = {
        lat: 1.223789,
        lng: -77.283255,
        address: 'Centro de Pasto, Nariño'
      };

      if (activeInput === 'pickup') {
        setPickupInput(pastoLocation.address || 'Centro de Pasto, Nariño');
        setActiveInput('destination');
      } else {
        setDestinationInput(pastoLocation.address || 'Centro de Pasto, Nariño');
      }
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold">Planifica tu viaje</h1>
        <button
          onClick={handleDriverLogin}
          className="bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors flex items-center space-x-1 text-sm font-medium"
          title="Iniciar sesión como conductor"
        >
          <UserCheck className="w-4 h-4" />
          <span>Conductor</span>
        </button>
      </div>

      {/* Trip Options */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex space-x-4">
          <button
            onClick={() => setTripType('now')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
              tripType === 'now'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Iniciar viaje</span>
          </button>
          
          <button
            onClick={() => setForWho('me')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
              forWho === 'me'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300'
            }`}
          >
            <span>👤</span>
            <span>Para mí</span>
          </button>
        </div>
      </div>

      {/* Location Inputs */}
      <div className="px-4 py-4">
        <div className="relative border-2 border-black rounded-lg">
          {/* Pickup Input */}
          <div className="flex items-center p-4 border-b border-gray-200">
            <div className="w-3 h-3 bg-black rounded-full mr-4"></div>
            <input
              type="text"
              value={activeInput === 'pickup' ? searchQuery || pickupInput : pickupInput}
              onChange={(e) => {
                if (activeInput === 'pickup') {
                  setSearchQuery(e.target.value);
                  setPickupInput(e.target.value);
                } else {
                  setPickupInput(e.target.value);
                }
              }}
              onFocus={() => {
                setActiveInput('pickup');
                setSearchQuery(pickupInput);
              }}
              className="flex-1 text-base outline-none"
              placeholder="Punto de recogida"
            />
            {isSearching && activeInput === 'pickup' && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
          
          {/* Destination Input */}
          <div className="flex items-center p-4">
            <div className="w-3 h-3 border-2 border-black rounded-sm mr-4"></div>
            <input
              type="text"
              value={activeInput === 'destination' ? searchQuery || destinationInput : destinationInput}
              onChange={(e) => {
                if (activeInput === 'destination') {
                  setSearchQuery(e.target.value);
                  setDestinationInput(e.target.value);
                } else {
                  setDestinationInput(e.target.value);
                }
              }}
              onFocus={() => {
                setActiveInput('destination');
                setSearchQuery(destinationInput);
              }}
              className="flex-1 text-base outline-none text-blue-500"
              placeholder="¿A dónde vas?"
            />
            {isSearching && activeInput === 'destination' && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
          
          {/* Plus Button */}
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 px-4">
        {/* Mostrar resultados de búsqueda si hay query activo */}
        {searchQuery && searchResults.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Search className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Resultados de búsqueda</h3>
            </div>
            {searchResults.map((location, index) => (
              <button
                key={`search-${index}`}
                onClick={() => handleLocationResultClick(location)}
                className="w-full flex items-center space-x-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {location.display_name || location.address}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {location.type && `${location.type} • `}
                    {location.importance && `Relevancia: ${(location.importance * 100).toFixed(0)}%`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3 text-green-600" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Mostrar mensaje si está buscando */}
        {isSearching && searchQuery && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
            <span className="text-gray-500">Buscando ubicaciones...</span>
          </div>
        )}

        {/* Mostrar mensaje si no hay resultados */}
        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No se encontraron ubicaciones para "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
          </div>
        )}

        {/* Mostrar sugerencias por defecto cuando no hay búsqueda activa */}
        {!searchQuery && (
          <>
            {/* Botón para usar ubicación actual */}
            <div className="mb-4">
              <button
                onClick={handleUseCurrentLocation}
                className="w-full flex items-center space-x-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Usar mi ubicación actual</h3>
                  <p className="text-sm text-gray-500">Detectar automáticamente donde estoy</p>
                </div>
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Recientes</h3>
              </div>
              {defaultSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center space-x-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{suggestion.name}</h3>
                    <p className="text-sm text-gray-500">{suggestion.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{suggestion.distance}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Additional Options */}
            <div className="border-t border-gray-200 pt-4">
              <button className="w-full flex items-center space-x-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Buscar en otra ciudad</h3>
                </div>
              </button>

              <button className="w-full flex items-center space-x-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Establece la ubicación en el mapa</h3>
                </div>
              </button>

              <div className="py-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Ubicaciones guardadas</h3>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};