import { useState, useEffect, useCallback } from 'react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface GeolocationState {
  location: Location | null;
  status: 'loading' | 'success' | 'error' | 'denied' | 'timeout';
  error: string | null;
  accuracy: number | null;
}

interface UseSimpleGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  fallbackLocation?: Location;
  maxRetries?: number;
}

export const useSimpleGeolocation = (options: UseSimpleGeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 20000,
    maximumAge = 0,
    fallbackLocation = {
      lat: 1.2136,
      lng: -77.2811,
      address: 'Centro de Pasto, Nariño'
    },
    maxRetries = 2
  } = options;

  const [state, setState] = useState<GeolocationState>({
    location: null,
    status: 'loading',
    error: null,
    accuracy: null
  });

  const [retryCount, setRetryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Función para obtener ubicación GPS real
  const getCurrentLocation = useCallback(async () => {
    if (isInitialized && retryCount === 0) {
      console.log('🔄 Hook ya inicializado, evitando ejecución múltiple');
      return;
    }

    console.log(`🚀 Obteniendo ubicación GPS (intento ${retryCount + 1}/${maxRetries + 1})...`);
    
    setState(prev => ({ ...prev, status: 'loading', error: null }));

    // Verificar soporte de geolocalización
    if (!navigator.geolocation) {
      console.log('❌ Geolocalización no soportada, usando ubicación de Pasto');
      setState({
        location: fallbackLocation,
        status: 'success',
        error: 'Geolocalización no soportada. Usando ubicación de Pasto.',
        accuracy: null
      });
      return;
    }

    try {
      // Verificar permisos primero
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('📋 Estado del permiso:', permission.state);
        
        if (permission.state === 'denied') {
          console.log('🚫 Permisos denegados, usando ubicación de Pasto');
          setState({
            location: fallbackLocation,
            status: 'success',
            error: 'Permisos GPS denegados. Usando ubicación de Pasto.',
            accuracy: null
          });
          return;
        }
      }

      // Intentar obtener ubicación GPS con configuración estricta
      console.log('🛰️ Intentando GPS con alta precisión...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout GPS'));
        }, timeout);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          },
          {
            enableHighAccuracy,
            timeout,
            maximumAge
          }
        );
      });

      const accuracy = position.coords.accuracy;
      console.log(`📍 GPS obtenido con precisión: ${accuracy} metros`);

      // Verificar si la ubicación está en Colombia (aproximadamente)
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      // Colombia está aproximadamente entre:
      // Latitud: -4.2 a 12.5
      // Longitud: -81.8 a -66.9
      const isInColombia = lat >= -4.2 && lat <= 12.5 && lng >= -81.8 && lng <= -66.9;
      
      if (!isInColombia) {
        console.log('⚠️ Ubicación GPS fuera de Colombia, usando Pasto');
        setState({
          location: fallbackLocation,
          status: 'success',
          error: `GPS fuera de Colombia (${lat.toFixed(4)}, ${lng.toFixed(4)}). Usando Pasto.`,
          accuracy: null
        });
        return;
      }

      // Si la precisión es muy mala (>10000m), rechazar
      if (accuracy > 10000) {
        console.log(`⚠️ Precisión GPS muy baja (${Math.round(accuracy)}m), usando Pasto`);
        setState({
          location: fallbackLocation,
          status: 'success',
          error: `GPS impreciso (${Math.round(accuracy)}m). Usando Pasto.`,
          accuracy: null
        });
        setIsInitialized(true);
        return;
      }

      // Si la precisión es moderada (1000-10000m), advertir pero aceptar
      if (accuracy > 1000) {
        console.log(`⚠️ Precisión GPS moderada (${Math.round(accuracy)}m), pero aceptable`);
      }

      // Éxito - ubicación GPS válida
      const location: Location = {
        lat,
        lng,
        address: `Tu ubicación GPS (±${Math.round(accuracy)}m)`
      };

      console.log('✅ Ubicación GPS válida obtenida:', location);

      setState({
        location,
        status: 'success',
        error: null,
        accuracy
      });

      setIsInitialized(true);

    } catch (error: any) {
      console.log('❌ Error GPS:', error.message);

      // Si podemos reintentar
      if (retryCount < maxRetries) {
        console.log(`🔄 Reintentando GPS en 2 segundos... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
      } else {
        // Usar ubicación de Pasto como fallback final
        console.log('📍 Usando ubicación de Pasto como fallback final');
        setState({
          location: fallbackLocation,
          status: 'success',
          error: `GPS no disponible después de ${maxRetries + 1} intentos. Usando Pasto.`,
          accuracy: null
        });
        setIsInitialized(true);
      }
    }
  }, [
    enableHighAccuracy,
    timeout,
    maximumAge,
    fallbackLocation,
    maxRetries,
    retryCount,
    isInitialized
  ]);

  // Función para establecer ubicación manual
  const setManualLocation = useCallback((location: Location) => {
    console.log('📍 Estableciendo ubicación manual:', location);
    setState({
      location,
      status: 'success',
      error: 'Ubicación establecida manualmente',
      accuracy: null
    });
  }, []);

  // Función para usar ubicación de Pasto directamente
  const usePastoLocation = useCallback(() => {
    console.log('🏛️ Usando ubicación de Pasto directamente');
    const pastoLocation = {
      lat: 1.2136,
      lng: -77.2811,
      address: 'Centro de Pasto, Nariño (Manual)'
    };
    setState({
      location: pastoLocation,
      status: 'success',
      error: 'Ubicación establecida manualmente en Pasto',
      accuracy: null
    });
    setIsInitialized(true);
  }, []);

  // Función para reintentar manualmente
  const retry = useCallback(() => {
    setRetryCount(0);
    setIsInitialized(false);
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Efecto para inicializar y reintentar
  useEffect(() => {
    if (!isInitialized || retryCount > 0) {
      getCurrentLocation();
    }
  }, [retryCount, isInitialized, getCurrentLocation]);

  return {
    ...state,
    retry,
    setManualLocation,
    usePastoLocation,
    retryCount
  };
};