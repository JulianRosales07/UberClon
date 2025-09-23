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
import { getNearbyDrivers, requestRide } from '../../services/rideService';
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
    user,
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

  useEffect(() => {
    // Obtener ubicación actual usando geolocalización del navegador
    if (!currentLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Intentar geocodificación inversa con la API
              const response = await fetch(`${import.meta.env.VITE_API_URL}/locations-test/details/${position.coords.latitude}/${position.coords.longitude}`);
              const data = await response.json();
              
              const location: Location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: data.success ? data.data.display_name : 'Tu ubicación actual'
              };
              
              setCurrentLocation(location);
              setPickupLocation(location);
            } catch (error) {
              console.error('Error en geocodificación inversa:', error);
              // Usar coordenadas sin dirección
              const location: Location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: 'Tu ubicación actual'
              };
              setCurrentLocation(location);
              setPickupLocation(location);
            }
          },
          (error) => {
            console.warn('Error obteniendo ubicación:', error);
            // Fallback a Pasto
            const pastoLocation: Location = {
              lat: 1.223789,
              lng: -77.283255,
              address: 'Centro de Pasto, Nariño'
            };
            setCurrentLocation(pastoLocation);
            setPickupLocation(pastoLocation);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      } else {
        // Fallback a Pasto si no hay geolocalización
        const pastoLocation: Location = {
          lat: 1.223789,
          lng: -77.283255,
          address: 'Centro de Pasto, Nariño'
        };
        setCurrentLocation(pastoLocation);
        setPickupLocation(pastoLocation);
      }
    }
  }, [currentLocation, setCurrentLocation, setPickupLocation]);

  const handleLocationSelect = async (pickup: Location, destination: Location) => {
    // Si el pickup no tiene coordenadas precisas, intentar geocodificar
    let finalPickup = pickup;
    let finalDestination = destination;

    try {
      // Si el pickup es solo texto, buscar coordenadas
      if (!pickup.lat || pickup.lat === 1.223789) {
        const pickupResponse = await fetch(`${import.meta.env.VITE_API_URL}/locations-test/search?query=${encodeURIComponent(pickup.address || '')}&limit=1`);
        const pickupData = await pickupResponse.json();
        
        if (pickupData.success && pickupData.data.length > 0) {
          finalPickup = {
            lat: pickupData.data[0].lat,
            lng: pickupData.data[0].lon,
            address: pickupData.data[0].display_name
          };
        }
      }

      // Si el destino necesita coordenadas más precisas
      if (destination.address && (!destination.lat || !destination.lng)) {
        const destResponse = await fetch(`${import.meta.env.VITE_API_URL}/locations-test/search?query=${encodeURIComponent(destination.address)}&limit=1`);
        const destData = await destResponse.json();
        
        if (destData.success && destData.data.length > 0) {
          finalDestination = {
            lat: destData.data[0].lat,
            lng: destData.data[0].lon,
            address: destData.data[0].display_name
          };
        }
      }
    } catch (error) {
      console.error('Error geocodificando ubicaciones:', error);
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

  const handleRideSelect = async (option: any) => {
    if (pickupLocation && destinationLocation) {
      try {
        // Calcular distancia real usando la API
        const response = await fetch(`${import.meta.env.VITE_API_URL}/locations-test/distance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: { lat: pickupLocation.lat, lon: pickupLocation.lng },
            to: { lat: destinationLocation.lat, lon: destinationLocation.lng }
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          const distance = data.data.distance;
          const request: RideRequest = {
            pickup: pickupLocation,
            destination: destinationLocation,
            estimatedFare: Math.ceil(distance * 2500 + 3000), // $2500 por km + tarifa base
            estimatedTime: Math.ceil(distance * 2 + 5), // 2 min por km + tiempo base
            distance: distance
          };
          setRideRequest(request);
          setShowRideOptions(false);

          // Simular búsqueda y asignación de conductor
          const trip = await requestRide(pickupLocation, destinationLocation, request.estimatedFare);
          setCurrentTrip(trip);
          setRideRequest(null);
        } else {
          throw new Error('Error calculando distancia');
        }
      } catch (error) {
        console.error('Error al solicitar viaje:', error);
        // Fallback con datos estimados
        const request: RideRequest = {
          pickup: pickupLocation,
          destination: destinationLocation,
          estimatedFare: option.price,
          estimatedTime: option.estimatedTime,
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

  // Cargar conductores cercanos cuando se establece la ubicación
  useEffect(() => {
    if (currentLocation) {
      getNearbyDrivers(currentLocation).then(drivers => {
        setNearbyDrivers(drivers);
      });
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
        <h1 className="text-lg font-semibold">Solicitar viaje</h1>
        <button
          onClick={handleDriverLogin}
          className="bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors flex items-center space-x-1 text-sm font-medium"
          title="Iniciar sesión como conductor"
        >
          <UserCheck className="w-4 h-4" />
          <span>Conductor</span>
        </button>
      </div>

      <div className="flex-1">
        <Map
          center={currentLocation || { lat: 1.223789, lng: -77.283255 }}
          pickup={pickupLocation}
          destination={destinationLocation}
          drivers={nearbyDrivers}
        />
      </div>

      {/* Collapsible Bottom Panel */}
      <div className={`bg-white transition-all duration-300 ease-in-out ${
        bottomPanelExpanded ? 'h-auto' : 'h-24'
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
        <div className={`overflow-hidden transition-all duration-300 ${
          bottomPanelExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
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