import React, { useState, useEffect } from 'react';
import { Map } from '../common/Map';
import { RideOptions } from './RideOptions';
import { TripStatus } from './TripStatus';
import { DriverFound } from './DriverFound';
import { SearchScreen } from './SearchScreen';
import { HomeScreen } from './HomeScreen';
import { useAppStore } from '../../store/useAppStore';
import { getNearbyDrivers, requestRide } from '../../services/rideService';
import { MapPin, Navigation, X, ArrowLeft, UserCheck } from 'lucide-react';
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

  useEffect(() => {
    // Simular obtención de ubicación actual
    if (!currentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Tu ubicación actual'
          };
          setCurrentLocation(location);
          setPickupLocation(location);
        },
        () => {
          // Ubicación por defecto (Bogotá)
          const defaultLocation: Location = {
            lat: 4.6097,
            lng: -74.0817,
            address: 'Bogotá, Colombia'
          };
          setCurrentLocation(defaultLocation);
          setPickupLocation(defaultLocation);
        }
      );
    }
  }, [currentLocation, setCurrentLocation, setPickupLocation]);

  const handleLocationSelect = (pickup: Location, destination: Location) => {
    setPickupLocation(pickup);
    setDestinationLocation(destination);
    setShowSearchScreen(false);
    setShowHomeScreen(false); // Ir al mapa después de seleccionar ubicaciones
    setShowRideOptions(true);
  };

  const handleGoToMap = () => {
    setShowHomeScreen(false);
  };

  const handleQuickRide = async (destination?: any) => {
    if (currentLocation) {
      let targetDestination: Location;
      let estimatedFare: number;
      let estimatedTime: number;
      
      if (destination) {
        // Usar destino específico seleccionado
        targetDestination = {
          lat: destination.coordinates.lat,
          lng: destination.coordinates.lng,
          address: destination.address
        };
        estimatedFare = destination.price;
        estimatedTime = destination.estimatedTime;
      } else {
        // Usar destino cercano por defecto
        targetDestination = {
          lat: currentLocation.lat + 0.01,
          lng: currentLocation.lng + 0.01,
          address: 'Destino cercano'
        };
        estimatedFare = 8500;
        estimatedTime = 5;
      }
      
      setPickupLocation(currentLocation);
      setDestinationLocation(targetDestination);
      setShowHomeScreen(false);
      
      // Crear solicitud de viaje rápido
      const quickRequest: RideRequest = {
        pickup: currentLocation,
        destination: targetDestination,
        estimatedFare: estimatedFare,
        estimatedTime: estimatedTime,
        distance: destination ? parseFloat(destination.distance) : 2
      };
      
      setRideRequest(quickRequest);
      
      try {
        // Simular búsqueda y asignación de conductor
        const trip = await requestRide(currentLocation, targetDestination, estimatedFare);
        setCurrentTrip(trip);
        setRideRequest(null);
      } catch (error) {
        console.error('Error al solicitar viaje rápido:', error);
        setRideRequest(null);
      }
    }
  };

  const handleRideSelect = async (option: any) => {
    if (pickupLocation && destinationLocation) {
      const request: RideRequest = {
        pickup: pickupLocation,
        destination: destinationLocation,
        estimatedFare: option.price,
        estimatedTime: option.estimatedTime,
        distance: 5 // Simulado
      };
      setRideRequest(request);
      setShowRideOptions(false);

      try {
        // Simular búsqueda y asignación de conductor
        const trip = await requestRide(pickupLocation, destinationLocation, option.price);
        setCurrentTrip(trip);
        setRideRequest(null);
      } catch (error) {
        console.error('Error al solicitar viaje:', error);
        setRideRequest(null);
      }
    }
  };

  const handleCancelRequest = () => {
    setRideRequest(null);
    setShowRideOptions(false);
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

  if (currentTrip) {
    // Si el viaje fue recién aceptado, mostrar información del conductor
    if (currentTrip.status === 'accepted') {
      return (
        <div className="h-screen flex flex-col">
          <div className="flex-1">
            <Map
              center={currentLocation || { lat: 4.6097, lng: -74.0817 }}
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
            center={currentLocation || { lat: 4.6097, lng: -74.0817 }}
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
          center={currentLocation || { lat: 4.6097, lng: -74.0817 }}
          pickup={pickupLocation}
          destination={destinationLocation}
          drivers={nearbyDrivers}
        />
      </div>

      <div className="bg-white p-6 space-y-4">
        <h2 className="text-2xl font-bold">¿A dónde vamos?</h2>

        <button
          onClick={() => setShowSearchScreen(true)}
          className="w-full flex items-center bg-gray-100 rounded-lg px-4 py-3 text-left"
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
      </div>

      {showRideOptions && pickupLocation && destinationLocation && (
        <RideOptions
          onSelectRide={handleRideSelect}
          distance={5} // Simulado
        />
      )}
    </div>
  );
};