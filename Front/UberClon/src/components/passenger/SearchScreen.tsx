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

  // Deshabilitar sugerencias de prueba - solo mostrar cuando el usuario busque
  const defaultSuggestions: LocationSuggestion[] = [];

  // Base de datos simulada de ubicaciones en Pasto
  const simulatedLocations = [
    // Centros comerciales
    { name: 'Unicentro', lat: 1.216386, lng: -77.288671, type: 'centro_comercial' },
    { name: 'Unicentro Pasto', lat: 1.216386, lng: -77.288671, type: 'centro_comercial' },
    { name: 'Centro Comercial Unicentro', lat: 1.216386, lng: -77.288671, type: 'centro_comercial' },
    { name: 'Único Centro Comercial', lat: 1.205879, lng: -77.260628, type: 'centro_comercial' },
    { name: 'Único', lat: 1.205879, lng: -77.260628, type: 'centro_comercial' },
    { name: 'Centro Nariño', lat: 1.215789, lng: -77.280255, type: 'centro_comercial' },
    
    // Lugares centrales
    { name: 'Centro de Pasto', lat: 1.223789, lng: -77.283255, type: 'centro' },
    { name: 'Centro', lat: 1.223789, lng: -77.283255, type: 'centro' },
    { name: 'Plaza de Nariño', lat: 1.213789, lng: -77.281255, type: 'plaza' },
    { name: 'Catedral de Pasto', lat: 1.213889, lng: -77.281355, type: 'iglesia' },
    { name: 'Alcaldía de Pasto', lat: 1.214789, lng: -77.282255, type: 'gobierno' },
    
    // Universidades
    { name: 'Universidad Mariana', lat: 1.223802, lng: -77.283742, type: 'universidad' },
    { name: 'Mariana', lat: 1.223802, lng: -77.283742, type: 'universidad' },
    { name: 'UDENAR', lat: 1.214789, lng: -77.273255, type: 'universidad' },
    { name: 'Universidad de Nariño', lat: 1.214789, lng: -77.273255, type: 'universidad' },
    
    // Transporte
    { name: 'Aeropuerto Antonio Nariño', lat: 1.396389, lng: -77.291667, type: 'aeropuerto' },
    { name: 'Aeropuerto', lat: 1.396389, lng: -77.291667, type: 'aeropuerto' },
    { name: 'Terminal de Transportes', lat: 1.218789, lng: -77.288255, type: 'terminal' },
    { name: 'Terminal', lat: 1.218789, lng: -77.288255, type: 'terminal' },
    
    // Salud
    { name: 'Hospital Departamental', lat: 1.228789, lng: -77.278255, type: 'hospital' },
    { name: 'Hospital', lat: 1.228789, lng: -77.278255, type: 'hospital' },
    
    // Deportes y recreación
    { name: 'Estadio Libertad', lat: 1.198087, lng: -77.278660, type: 'estadio' },
    { name: 'Estadio', lat: 1.198087, lng: -77.278660, type: 'estadio' },
    { name: 'Parque Infantil', lat: 1.218915, lng: -77.281944, type: 'parque' },
    { name: 'Parque', lat: 1.218915, lng: -77.281944, type: 'parque' },
    
    // Barrios
    { name: 'Tamasagra', lat: 1.204400, lng: -77.293005, type: 'barrio' },
    { name: 'Alvernia', lat: 1.220019, lng: -77.298537, type: 'barrio' },
    { name: 'Bombona', lat: 1.235789, lng: -77.275255, type: 'barrio' },
    { name: 'Chapalito', lat: 1.208789, lng: -77.295255, type: 'barrio' },
    { name: 'Fátima', lat: 1.240789, lng: -77.270255, type: 'barrio' },
    
    // Avenidas y calles
    { name: 'Avenida de los Estudiantes', lat: 1.226829, lng: -77.282465, type: 'avenida' },
    { name: 'Estudiantes', lat: 1.226829, lng: -77.282465, type: 'avenida' },
    
    // Mercados
    { name: 'Mercado Potrerillo', lat: 1.220789, lng: -77.285255, type: 'mercado' },
    { name: 'Potrerillo', lat: 1.220789, lng: -77.285255, type: 'mercado' },
    
    // Lugares adicionales populares
    { name: 'Galeras', lat: 1.220000, lng: -77.360000, type: 'volcan' },
    { name: 'Volcán Galeras', lat: 1.220000, lng: -77.360000, type: 'volcan' },
    { name: 'Laguna de la Cocha', lat: 1.150000, lng: -77.166667, type: 'laguna' },
    { name: 'La Cocha', lat: 1.150000, lng: -77.166667, type: 'laguna' }
  ];

  // Función para buscar ubicaciones usando API real + fallback local
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    console.log('🔍 Buscando con API real:', query);
    
    // Función para crear resultado seguro desde API
    const createApiResult = (apiLocation: any) => {
      // Extraer solo el texto del display_name, ignorando objetos anidados
      let displayName = 'Ubicación sin nombre';
      if (typeof apiLocation.display_name === 'string') {
        displayName = apiLocation.display_name;
      } else if (typeof apiLocation.name === 'string') {
        displayName = apiLocation.name;
      }

      // Extraer tipo de forma segura
      let locationType = 'lugar';
      if (typeof apiLocation.type === 'string') {
        locationType = apiLocation.type;
      } else if (typeof apiLocation.class === 'string') {
        locationType = apiLocation.class;
      }

      return {
        lat: parseFloat(apiLocation.lat) || 0,
        lng: parseFloat(apiLocation.lon) || 0,
        address: displayName,
        display_name: displayName,
        type: locationType,
        importance: parseFloat(apiLocation.importance) || 0.5,
        place_id: `api_${apiLocation.place_id || Date.now()}`
      };
    };

    // Función para crear resultado local
    const createLocalResult = (localLocation: any) => ({
      lat: localLocation.lat,
      lng: localLocation.lng,
      address: localLocation.name,
      display_name: `${localLocation.name}, Pasto, Nariño (Local)`,
      type: localLocation.type,
      importance: 0.8,
      place_id: `local_${localLocation.name.replace(/\s+/g, '_').toLowerCase()}`
    });

    // Deshabilitar resultados locales simulados para usar solo API real
    const localResults: any[] = [];

    // Verificar conectividad antes de intentar API
    if (!navigator.onLine) {
      console.log('🌐 Sin conexión a internet, no hay resultados disponibles');
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      // Intentar API de Nominatim con timeout corto
      const searchUrl = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
        q: `${query}, Pasto, Nariño, Colombia`,
        format: 'json',
        limit: '3',
        addressdetails: '0',
        extratags: '0',
        namedetails: '0',
        countrycodes: 'co',
        bounded: '1',
        viewbox: '-77.4,-77.1,1.1,1.4'
      });

      console.log('🌐 Consultando API:', searchUrl);

      // Timeout de 3 segundos para la API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'UberClon/1.0.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const apiData = await response.json();
      console.log('📡 Respuesta API:', apiData);

      // Procesar resultados de API
      const apiResults = apiData
        .slice(0, 3)
        .map(createApiResult)
        .filter(result => result.display_name !== 'Ubicación sin nombre');

      // Solo usar resultados de API real
      console.log('✅ Resultados de API real:', apiResults.length, apiResults);
      setSearchResults(apiResults);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('⏱️ Timeout de API, usando resultados locales');
      } else {
        console.error('❌ Error en API:', error.message);
      }
      
      console.log('📍 API falló, no hay resultados disponibles');
      setSearchResults([]);
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

  // Función mejorada para usar la ubicación actual
  const handleUseCurrentLocation = async () => {
    setIsSearching(true);
    
    try {
      // Primero intentar usar la ubicación del contexto
      if (currentLocation && currentLocation.address !== 'Centro de Pasto, Nariño') {
        const currentLoc: Location = {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address: currentLocation.address || 'Tu ubicación actual'
        };

        if (activeInput === 'pickup') {
          setPickupInput(currentLoc.address);
          setActiveInput('destination');
        } else {
          setDestinationInput(currentLoc.address);
          const pickup: Location = {
            lat: currentLocation?.lat || 1.223789,
            lng: currentLocation?.lng || -77.283255,
            address: pickupInput
          };
          onLocationSelect(pickup, currentLoc);
        }
        setIsSearching(false);
        return;
      }

      // Si no hay ubicación del contexto, intentar obtenerla directamente
      if (!navigator.geolocation) {
        throw new Error('Geolocalización no soportada');
      }

      // Verificar permisos
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          throw new Error('Permisos de geolocalización denegados');
        }
      }

      // Obtener ubicación actual
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 300000
          }
        );
      });

      const currentLoc: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        address: 'Tu ubicación actual'
      };

      console.log('✅ Ubicación obtenida en SearchScreen:', currentLoc);

      if (activeInput === 'pickup') {
        setPickupInput(currentLoc.address);
        setActiveInput('destination');
      } else {
        setDestinationInput(currentLoc.address);
        const pickup: Location = {
          lat: 1.223789,
          lng: -77.283255,
          address: pickupInput
        };
        onLocationSelect(pickup, currentLoc);
      }

    } catch (error: any) {
      console.warn('❌ Error obteniendo ubicación en SearchScreen:', error);
      
      // Usar ubicación por defecto
      const defaultLocation: Location = {
        lat: 1.223789,
        lng: -77.283255,
        address: 'Centro de Pasto, Nariño'
      };

      if (activeInput === 'pickup') {
        setPickupInput(defaultLocation.address);
        setActiveInput('destination');
      } else {
        setDestinationInput(defaultLocation.address);
      }
      
      // Mostrar mensaje de error al usuario
      alert('No se pudo obtener tu ubicación. Usando ubicación por defecto en Pasto.');
    } finally {
      setIsSearching(false);
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
        <div className="text-center">
          <h1 className="text-lg font-semibold">Planifica tu viaje</h1>
          <p className="text-xs text-green-600">✓ Modo offline activo</p>
        </div>
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Resultados de búsqueda</h3>
              </div>
              <div className="text-xs text-gray-500">
                {searchResults.length > 0 && searchResults[0]?.place_id?.startsWith('api_') ? '🌐 API + Local' : '📍 Solo Local'}
              </div>
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
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {location.display_name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {location.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      location.place_id.startsWith('api_') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {location.place_id.startsWith('api_') ? '🌐 API' : '📍 Local'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(location.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
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
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-green-500 mb-2" />
            <span className="text-gray-700 font-medium">Buscando ubicaciones...</span>
            <span className="text-sm text-gray-500 mt-1">🌐 OpenStreetMap + 📍 Base local</span>
          </div>
        )}

        {/* Mostrar mensaje si no hay resultados */}
        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No se encontraron ubicaciones para "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mt-1">Intenta con: unicentro, centro, terminal, hospital</p>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
              <p className="text-xs text-gray-600 font-medium">Ubicaciones disponibles:</p>
              <p className="text-xs text-gray-500 mt-1">
                Unicentro, Único, Centro, Terminal, Hospital, Universidad Mariana, Aeropuerto, Estadio, Tamasagra, Alvernia
              </p>
            </div>
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
                disabled={isSearching}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {isSearching ? (
                    <Navigation className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {isSearching ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isSearching ? 'Activando GPS...' : 'Detectar automáticamente donde estoy'}
                  </p>
                </div>
              </button>
            </div>

            {/* Mensaje de ayuda para geolocalización */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <div className="text-blue-600 mt-0.5">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900">💡 Consejo para GPS</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Si no funciona la ubicación, permite el acceso en tu navegador haciendo clic en el ícono 🔒 junto a la URL
                  </p>
                </div>
              </div>
            </div>

            {/* Información de conectividad */}
            <div className={`mb-4 p-3 rounded-lg border ${
              navigator.onLine 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${
                  navigator.onLine ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
                <h4 className={`text-sm font-medium ${
                  navigator.onLine ? 'text-green-900' : 'text-orange-900'
                }`}>
                  {navigator.onLine ? '🌐 Modo Híbrido Activo' : '📍 Modo Offline Activo'}
                </h4>
              </div>
              <p className={`text-xs ${
                navigator.onLine ? 'text-green-700' : 'text-orange-700'
              }`}>
                {navigator.onLine 
                  ? 'Combinando OpenStreetMap + base de datos local para mejores resultados'
                  : 'Sin conexión a internet - usando solo base de datos local de Pasto'
                }
              </p>
            </div>

            {/* Sugerencias rápidas */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Search className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Búsquedas populares</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Unicentro Pasto', 'Centro Pasto', 'Terminal Pasto', 'Hospital Pasto', 'Universidad Mariana'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      if (activeInput === 'destination') {
                        setDestinationInput(term);
                      } else {
                        setPickupInput(term);
                      }
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
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