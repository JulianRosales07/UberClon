import React, { useState, useEffect } from 'react';
import { Map } from '../common/Map';
import { RideOptions } from './RideOptions';
import { TripStatus } from './TripStatus';
import { DriverFound } from './DriverFound';
import { SearchScreen } from './SearchScreen';
import { HomeScreen } from './HomeScreen';
import { InTripView } from './InTripView';
import { PaymentView } from './PaymentView';
import { useAppStore } from '../../store/useAppStore';
// Removido import innecesario ya que usamos simulación local
// Importar funciones de geolocalización
import { MapPin, Navigation, X, ArrowLeft, UserCheck, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../common/Button';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface RideRequest {
  pickup: Location;
  destination: Location;
  estimatedFare: number;
  estimatedTime: number;
  distance: number;
}

export const PassengerHome: React.FC = () => {
  const {
    currentLocation,
    pickupLocation,
    destinationLocation,
    currentTrip,
    rideRequest,
    nearbyDrivers,
    logout,
    setPickupLocation,
    setDestinationLocation,
    setRideRequest,
    setCurrentLocation,
    setCurrentTrip,
    setNearbyDrivers
  } = useAppStore();

  const [showRideOptions, setShowRideOptions] = useState(false);
  const [showSearchScreen, setShowSearchScreen] = useState(false);
  const [showHomeScreen, setShowHomeScreen] = useState(true);
  const [showInTrip, setShowInTrip] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bottomPanelExpanded, setBottomPanelExpanded] = useState(false);

  // Estado para manejar la geolocalización
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error' | 'denied'>('loading');

  // Verificar si estamos en un contexto seguro (HTTPS o localhost)
  const isSecureContext = () => {
    return window.isSecureContext ||
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
  };

  // Función de diagnóstico
  const runGeolocationDiagnostic = () => {
    console.log('🔍 === DIAGNÓSTICO DE GEOLOCALIZACIÓN ===');
    console.log('Navigator disponible:', !!navigator);
    console.log('Geolocation API disponible:', !!navigator.geolocation);
    console.log('Contexto seguro (HTTPS/localhost):', isSecureContext());
    console.log('URL actual:', window.location.href);
    console.log('Protocolo:', window.location.protocol);
    console.log('Hostname:', window.location.hostname);
    console.log('User Agent:', navigator.userAgent);

    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(permission => {
        console.log('Estado del permiso:', permission.state);
      });
    } else {
      console.log('Permissions API no disponible');
    }
  };

  const initializeLocation = async () => {
    console.log('🚀 Iniciando geolocalización...');
    runGeolocationDiagnostic();
    setLocationStatus('loading');

    // Función para establecer ubicación por defecto
    const setDefaultLocation = (reason: string) => {
      console.log(`📍 Usando ubicación por defecto: ${reason}`);
      const defaultLocation: Location = {
        lat: 1.223789,
        lng: -77.283255,
        address: 'Centro de Pasto, Nariño'
      };
      setCurrentLocation(defaultLocation);
      setPickupLocation(defaultLocation);
      setLocationStatus('error');
    };

    // Verificar si la geolocalización está disponible
    if (!navigator.geolocation) {
      setDefaultLocation('Geolocalización no soportada por el navegador');
      return;
    }

    // Verificar contexto seguro
    if (!isSecureContext()) {
      console.warn('⚠️ Geolocalización requiere HTTPS o localhost');
      setDefaultLocation('Geolocalización requiere conexión segura (HTTPS)');
      return;
    }

    try {
      // Verificar permisos primero
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Estado del permiso de geolocalización:', permission.state);

        if (permission.state === 'denied') {
          setDefaultLocation('Permisos de geolocalización denegados');
          return;
        }
      }

      // Intentar obtener la ubicación
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });

      // Éxito - usar ubicación real
      const location: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        address: 'Tu ubicación actual'
      };

      console.log('✅ Ubicación obtenida exitosamente:', location);
      setCurrentLocation(location);
      setPickupLocation(location);
      setLocationStatus('success');

    } catch (error: any) {
      console.warn('❌ Error obteniendo ubicación:', error);

      // Manejar diferentes tipos de errores
      let reason = 'Error desconocido';
      if (error.code) {
        switch (error.code) {
          case 1:
            reason = 'Permisos denegados por el usuario';
            setLocationStatus('denied');
            break;
          case 2:
            reason = 'Sin conexión a internet - usando modo offline';
            console.log('🌐 Detectado modo offline, usando ubicación por defecto');
            break;
          case 3:
            reason = 'Timeout - tomó demasiado tiempo';
            break;
          default:
            reason = `Error de geolocalización (código: ${error.code})`;
        }
      }

      setDefaultLocation(reason);
    }
  };

  useEffect(() => {
    if (!currentLocation) {
      initializeLocation();
    }
  }, [currentLocation, setCurrentLocation, setPickupLocation]);

  // Datos simulados de ubicaciones populares en Pasto
  const getSimulatedCoordinates = (address: string): { lat: number; lng: number } => {
    const locations: { [key: string]: { lat: number; lng: number } } = {
      'centro': { lat: 1.223789, lng: -77.283255 },
      'universidad': { lat: 1.214789, lng: -77.273255 },
      'aeropuerto': { lat: 1.396389, lng: -77.291667 },
      'terminal': { lat: 1.218789, lng: -77.288255 },
      'hospital': { lat: 1.228789, lng: -77.278255 },
      'mall': { lat: 1.233789, lng: -77.273255 },
      'estadio': { lat: 1.213789, lng: -77.293255 },
      'parque': { lat: 1.225789, lng: -77.285255 }
    };

    // Buscar coincidencias parciales
    const searchTerm = address.toLowerCase();
    for (const [key, coords] of Object.entries(locations)) {
      if (searchTerm.includes(key) || key.includes(searchTerm)) {
        return coords;
      }
    }

    // Si no encuentra coincidencia, generar coordenadas aleatorias cerca de Pasto
    return {
      lat: 1.223789 + (Math.random() - 0.5) * 0.1,
      lng: -77.283255 + (Math.random() - 0.5) * 0.1
    };
  };

  const handleLocationSelect = async (pickup: Location, destination: Location) => {
    let finalPickup = pickup;
    let finalDestination = destination;

    // Si el pickup no tiene coordenadas precisas, usar simulación
    if (!pickup.lat || pickup.lat === 1.223789) {
      const coords = getSimulatedCoordinates(pickup.address || '');
      finalPickup = {
        lat: coords.lat,
        lng: coords.lng,
        address: pickup.address || 'Ubicación seleccionada'
      };
    }

    // Si el destino necesita coordenadas
    if (destination.address && (!destination.lat || !destination.lng)) {
      const coords = getSimulatedCoordinates(destination.address);
      finalDestination = {
        lat: coords.lat,
        lng: coords.lng,
        address: destination.address
      };
    }

    setPickupLocation(finalPickup);
    setDestinationLocation(finalDestination);
    setShowSearchScreen(false);
    setShowHomeScreen(false);
    setShowRideOptions(true);
  };

  const handleGoToMap = () => {
    setShowHomeScreen(false);
  };

  const handleQuickRide = async (destination?: any) => {
    if (currentLocation) {
      let targetDestination: Location;

      if (destination) {
        // Usar destino específico seleccionado
        targetDestination = {
          lat: destination.coordinates.lat,
          lng: destination.coordinates.lng,
          address: destination.address
        };
      } else {
        // Usar destino cercano por defecto
        targetDestination = {
          lat: currentLocation.lat + 0.01,
          lng: currentLocation.lng + 0.01,
          address: 'Destino cercano'
        };
      }

      setPickupLocation(currentLocation);
      setDestinationLocation(targetDestination);
      setShowHomeScreen(false);

      // Mostrar opciones de viaje
      setShowRideOptions(true);
    }
  };

  // Función para calcular distancia usando fórmula de Haversine (sin backend)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
  };

  const handleRideSelect = async (option: any) => {
    if (pickupLocation && destinationLocation) {
      try {
        // Validar que tenemos coordenadas válidas
        if (!pickupLocation.lat || !pickupLocation.lng || !destinationLocation.lat || !destinationLocation.lng) {
          throw new Error('Coordenadas inválidas');
        }

        // Calcular distancia localmente
        const distance = calculateDistance(
          pickupLocation.lat,
          pickupLocation.lng,
          destinationLocation.lat,
          destinationLocation.lng
        );

        const request: RideRequest = {
          pickup: pickupLocation,
          destination: destinationLocation,
          estimatedFare: Math.ceil(distance * 2500 + 3000), // $2500 por km + tarifa base
          estimatedTime: Math.ceil(distance * 2 + 5), // 2 min por km + tiempo base
          distance: distance
        };

        setRideRequest(request);
        setShowRideOptions(false);

        // Simular búsqueda y asignación de conductor (sin backend)
        setTimeout(() => {
          const simulatedTrip = {
            id: `trip_${Date.now()}`,
            passengerId: 'current-user',
            driverId: 'driver_1',
            status: 'accepted' as const,
            pickup: pickupLocation,
            destination: destinationLocation,
            fare: request.estimatedFare,
            estimatedTime: request.estimatedTime,
            distance: distance,
            driver: {
              id: 'driver_1',
              name: 'Juan Carlos Pérez',
              email: 'juan.perez@email.com',
              phone: '+57 300 123 4567',
              rating: 4.9,
              userType: 'driver' as const,
              vehicleInfo: {
                make: 'Toyota',
                model: 'Corolla',
                year: 2020,
                color: 'Blanco',
                licensePlate: 'ABC-123'
              },
              totalTrips: 1250,
              location: {
                lat: pickupLocation.lat + (Math.random() - 0.5) * 0.01,
                lng: pickupLocation.lng + (Math.random() - 0.5) * 0.01
              },
              isAvailable: false
            },
            createdAt: new Date()
          };

          setCurrentTrip(simulatedTrip);
          setRideRequest(null);
        }, 2000); // Simular 2 segundos de búsqueda

      } catch (error) {
        console.error('Error al solicitar viaje:', error);
        // Fallback con datos estimados
        const request: RideRequest = {
          pickup: pickupLocation,
          destination: destinationLocation,
          estimatedFare: option.price || 15000,
          estimatedTime: option.estimatedTime || 10,
          distance: 5
        };
        setRideRequest(request);
        setShowRideOptions(false);
      }
    }
  };

  const handleCancelRequest = () => {
    setRideRequest(null);
    setShowRideOptions(false);
  };

  const handleTripStart = () => {
    if (currentTrip) {
      setCurrentTrip({ ...currentTrip, status: 'in_progress' });
      setShowInTrip(true);
    }
  };

  const handleTripComplete = () => {
    if (currentTrip) {
      setCurrentTrip({ ...currentTrip, status: 'completed' });
      setShowInTrip(false);
      setShowPayment(true);
    }
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    setCurrentTrip(null);
    setPickupLocation(null);
    setDestinationLocation(null);
    setShowHomeScreen(true);
  };

  const handleDriverLogin = () => {
    logout(); // Cerrar sesión actual y volver a la página de inicio
  };

  // Generar conductores cercanos simulados
  const generateNearbyDrivers = (location: Location) => {
    const drivers = [];
    const driverNames = [
      'Carlos Rodríguez', 'María González', 'Luis Martínez', 'Ana López',
      'Pedro Sánchez', 'Laura Torres', 'Miguel Herrera', 'Sofia Ramírez'
    ];

    const vehicles = [
      { make: 'Toyota', model: 'Corolla', color: 'Blanco' },
      { make: 'Chevrolet', model: 'Spark', color: 'Rojo' },
      { make: 'Nissan', model: 'Versa', color: 'Gris' },
      { make: 'Hyundai', model: 'Accent', color: 'Azul' },
      { make: 'Renault', model: 'Logan', color: 'Negro' }
    ];

    for (let i = 0; i < 5; i++) {
      const vehicle = vehicles[i % vehicles.length];
      drivers.push({
        id: `driver_${i + 1}`,
        name: driverNames[i % driverNames.length],
        email: `${driverNames[i % driverNames.length].toLowerCase().replace(' ', '.')}@email.com`,
        phone: `+57 30${i} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`,
        rating: 4.2 + Math.random() * 0.8, // Rating entre 4.2 y 5.0
        userType: 'driver' as const,
        location: {
          lat: location.lat + (Math.random() - 0.5) * 0.02,
          lng: location.lng + (Math.random() - 0.5) * 0.02
        },
        vehicleInfo: {
          ...vehicle,
          year: 2018 + Math.floor(Math.random() * 6), // Años entre 2018-2023
          licensePlate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(100 + Math.random() * 900)}`
        },
        totalTrips: Math.floor(500 + Math.random() * 2000),
        isAvailable: true
      });
    }

    return drivers;
  };

  // Cargar conductores cercanos cuando se establece la ubicación
  useEffect(() => {
    if (currentLocation) {
      const simulatedDrivers = generateNearbyDrivers(currentLocation);
      setNearbyDrivers(simulatedDrivers);
    }
  }, [currentLocation, setNearbyDrivers]);

  // Mostrar pantalla principal de inicio
  if (showHomeScreen) {
    return (
      <HomeScreen
        onGoToMap={handleGoToMap}
        onSearch={() => setShowSearchScreen(true)}
        onQuickRide={handleQuickRide}
        currentLocation={currentLocation}
      />
    );
  }

  // Mostrar pantalla de búsqueda
  if (showSearchScreen) {
    return (
      <SearchScreen
        onBack={() => {
          setShowSearchScreen(false);
          if (showHomeScreen) {
            // Si venimos de HomeScreen, volver a HomeScreen
            setShowHomeScreen(true);
          }
        }}
        onLocationSelect={handleLocationSelect}
        currentLocation={currentLocation}
      />
    );
  }

  // Mostrar vista de pago
  if (showPayment && currentTrip) {
    return (
      <PaymentView
        trip={currentTrip}
        onPaymentComplete={handlePaymentComplete}
      />
    );
  }

  // Mostrar vista en viaje
  if (showInTrip && currentTrip) {
    return (
      <InTripView
        trip={currentTrip}
        onTripComplete={handleTripComplete}
      />
    );
  }

  if (currentTrip) {
    // Si el viaje fue recién aceptado, mostrar información del conductor
    if (currentTrip.status === 'accepted') {
      return (
        <div className="h-screen flex flex-col">
          <div className="flex-1">
            <Map
              center={currentLocation || { lat: 1.223789, lng: -77.283255 }}
              pickup={pickupLocation}
              destination={destinationLocation}
              drivers={nearbyDrivers}
            />
          </div>
          <DriverFound
            driver={{
              id: '1',
              name: 'Juan Carlos Pérez',
              rating: 4.9,
              vehicleInfo: {
                make: 'Toyota',
                model: 'Corolla',
                color: 'Blanco',
                licensePlate: 'ABC-123'
              },
              totalTrips: 1250
            }}
            estimatedArrival={3}
            onCancel={() => {
              setCurrentTrip(null);
              setRideRequest(null);
            }}
            onTripStart={handleTripStart}
          />
        </div>
      );
    }
    return <TripStatus trip={currentTrip} />;
  }

  if (rideRequest) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1">
          <Map
            center={currentLocation || { lat: 1.223789, lng: -77.283255 }}
            pickup={pickupLocation}
            destination={destinationLocation}
            drivers={nearbyDrivers}
          />
        </div>
        <div className="bg-white p-6">
          <div className="text-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Buscando conductor...</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelRequest}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="animate-pulse mb-4">
              <div className="w-16 h-16 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                <Navigation className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>

            <p className="text-gray-600 mb-4">Te conectaremos con un conductor cercano</p>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span>Tarifa estimada:</span>
                <span className="font-bold">${rideRequest.estimatedFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Tiempo estimado:</span>
                <span className="font-bold">{rideRequest.estimatedTime} min</span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>• Buscando en {nearbyDrivers.length} conductores cercanos</p>
              <p>• Tiempo promedio de espera: 2-5 minutos</p>
            </div>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="h-screen flex flex-col">
      {/* Header with back button */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={() => setShowHomeScreen(true)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-semibold">Solicitar viaje</h1>
          <div className="flex items-center justify-center space-x-2">
            {locationStatus === 'loading' && (
              <p className="text-xs text-blue-600">🔄 Obteniendo ubicación...</p>
            )}
            {locationStatus === 'success' && (
              <p className="text-xs text-green-600">✓ Ubicación GPS activa</p>
            )}
            {locationStatus === 'error' && (
              <p className="text-xs text-orange-600">⚠️ Usando ubicación por defecto</p>
            )}
            {locationStatus === 'denied' && (
              <div className="flex items-center space-x-1">
                <p className="text-xs text-red-600">❌ GPS denegado</p>
                <button
                  onClick={initializeLocation}
                  className="text-xs text-blue-600 underline"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>
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

      <div className="flex-1 relative">
        <Map
          center={currentLocation || { lat: 1.223789, lng: -77.283255 }}
          pickup={pickupLocation}
          destination={destinationLocation}
          drivers={nearbyDrivers}
        />

        {/* Botón flotante para activar GPS */}
        {(locationStatus === 'denied' || locationStatus === 'error') && (
          <button
            onClick={initializeLocation}
            className="absolute top-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-10"
            title="Activar ubicación GPS"
          >
            <Navigation className="w-5 h-5" />
          </button>
        )}

        {/* Indicador de carga de GPS */}
        {locationStatus === 'loading' && (
          <div className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg z-10">
            <Navigation className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Panel de diagnóstico de geolocalización */}
        {(locationStatus === 'denied' || locationStatus === 'error') && (
          <div className="absolute bottom-20 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-10">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">
                {locationStatus === 'denied' ? '🚫 GPS Bloqueado' : '⚠️ Error de GPS'}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {locationStatus === 'denied'
                  ? 'Los permisos de ubicación están bloqueados'
                  : 'No se pudo obtener tu ubicación actual'
                }
              </p>
              <div className="space-y-2">
                <button
                  onClick={initializeLocation}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  🔄 Reintentar GPS
                </button>
                <button
                  onClick={runGeolocationDiagnostic}
                  className="w-full bg-gray-500 text-white py-1 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  🔍 Ver diagnóstico en consola
                </button>
                <div className="text-xs text-gray-500">
                  <p>💡 Para activar GPS:</p>
                  <p>1. Haz clic en el ícono 🔒 junto a la URL</p>
                  <p>2. Permite "Ubicación"</p>
                  <p>3. Recarga la página</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Bottom Panel */}
      <div className={`bg-white transition-all duration-300 ease-in-out ${bottomPanelExpanded ? 'h-auto' : 'h-24'
        }`}>
        {/* Panel Header - Always Visible */}
        <div className="px-6 py-4">
          <button
            onClick={() => setBottomPanelExpanded(!bottomPanelExpanded)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-black rounded-full"></div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-gray-900">¿A dónde vamos?</h2>
                {(pickupLocation || destinationLocation) && (
                  <p className="text-sm text-gray-500">
                    {pickupLocation?.address && destinationLocation?.address
                      ? 'Ruta seleccionada'
                      : 'Toca para seleccionar ruta'
                    }
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              {bottomPanelExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
        </div>

        {/* Expandable Content */}
        <div className={`overflow-hidden transition-all duration-300 ${bottomPanelExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="px-6 pb-6">
            <button
              onClick={() => setShowSearchScreen(true)}
              className="w-full flex items-center bg-gray-100 rounded-lg px-4 py-3 text-left mb-4"
            >
              <div className="w-3 h-3 bg-black rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="text-gray-900 font-medium">
                  {pickupLocation?.address || 'Tu ubicación actual'}
                </div>
                <div className="text-blue-500 mt-1">
                  {destinationLocation?.address || '¿A dónde vas?'}
                </div>
              </div>
              <MapPin className="w-5 h-5 text-gray-400" />
            </button>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowSearchScreen(true)}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left hover:bg-blue-100 transition-colors"
              >
                <div className="text-blue-600 font-medium text-sm">🏠 Casa</div>
                <div className="text-blue-500 text-xs">Agregar dirección</div>
              </button>
              <button
                onClick={() => setShowSearchScreen(true)}
                className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-left hover:bg-purple-100 transition-colors"
              >
                <div className="text-purple-600 font-medium text-sm">💼 Trabajo</div>
                <div className="text-purple-500 text-xs">Agregar dirección</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRideOptions && pickupLocation && destinationLocation && (
        <div className="absolute bottom-0 left-0 right-0">
          <RideOptions
            onSelectRide={handleRideSelect}
            distance={5} // Simulado
          />
        </div>
      )}
    </div>
  );
};