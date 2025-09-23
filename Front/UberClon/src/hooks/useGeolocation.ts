import { useState, useEffect, useCallback, useRef } from 'react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface CustomGeolocationPosition {
  coordinates: Location;
  accuracy: number;
  timestamp: number;
  address?: string;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
  onLocationUpdate?: (position: CustomGeolocationPosition) => void;
  onLocationError?: (error: GeolocationPositionError) => void;
  usePastoLocation?: boolean; // Para desarrollo/demo
  autoStart?: boolean;
}

interface UseGeolocationReturn {
  location: CustomGeolocationPosition | null;
  error: string | null;
  isLoading: boolean;
  isWatching: boolean;
  getCurrentLocation: () => Promise<CustomGeolocationPosition>;
  startWatching: () => void;
  stopWatching: () => void;
  clearError: () => void;
}

export const useGeolocation = (options: GeolocationOptions = {}): UseGeolocationReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    watch = false,
    onLocationUpdate,
    autoStart = false
  } = options;

  const [location, setLocation] = useState<CustomGeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  
  const watchIdRef = useRef<number | null>(null);

  const geolocationOptions: PositionOptions = {
    enableHighAccuracy,
    timeout,
    maximumAge
  };

  const handleSuccess = useCallback(async (position: GeolocationPosition) => {
    const newLocation: CustomGeolocationPosition = {
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      },
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    };

    // Try to get address using reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.coordinates.lat}&lon=${newLocation.coordinates.lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        newLocation.address = data.display_name;
        newLocation.coordinates.address = data.display_name;
      }
    } catch (geocodeError) {
      console.warn('Failed to get address:', geocodeError);
    }

    setLocation(newLocation);
    setError(null);
    setIsLoading(false);
    onLocationUpdate?.(newLocation);
  }, [onLocationUpdate]);

  const handleError = useCallback((_error: GeolocationPositionError) => {
    // Siempre usar ubicación de Pasto
    const pastoLocation: CustomGeolocationPosition = {
      coordinates: {
        lat: 1.223789,
        lng: -77.283255,
        address: 'Centro de Pasto, Nariño'
      },
      accuracy: 10,
      timestamp: Date.now(),
      address: 'Centro de Pasto, Nariño'
    };

    setLocation(pastoLocation);
    setError(null); // No mostrar error, usar Pasto directamente
    setIsLoading(false);
    onLocationUpdate?.(pastoLocation);
  }, [onLocationUpdate]);

  const getCurrentLocation = useCallback((): Promise<CustomGeolocationPosition> => {
    return new Promise((resolve) => {
      // Siempre usar ubicación de Pasto para esta aplicación
      const pastoLocation: CustomGeolocationPosition = {
        coordinates: {
          lat: 1.223789,
          lng: -77.283255,
          address: 'Centro de Pasto, Nariño'
        },
        accuracy: 10,
        timestamp: Date.now(),
        address: 'Centro de Pasto, Nariño'
      };
      
      setLocation(pastoLocation);
      setError(null);
      setIsLoading(false);
      onLocationUpdate?.(pastoLocation);
      resolve(pastoLocation);
    });
  }, [onLocationUpdate]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation || isWatching) return;

    setIsWatching(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geolocationOptions
    );
  }, [handleSuccess, handleError, geolocationOptions, isWatching]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-start watching if enabled
  useEffect(() => {
    if (watch) {
      startWatching();
    }

    return () => {
      stopWatching();
    };
  }, [watch, startWatching, stopWatching]);

  // Auto-start getting location if enabled
  useEffect(() => {
    if (autoStart) {
      getCurrentLocation().catch(console.error);
    }
  }, [autoStart, getCurrentLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    location,
    error,
    isLoading,
    isWatching,
    getCurrentLocation,
    startWatching,
    stopWatching,
    clearError
  };
};