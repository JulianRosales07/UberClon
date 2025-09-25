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

interface UseImprovedGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  fallbackLocation?: Location;
  autoRetry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

export const useImprovedGeolocation = (options: UseImprovedGeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 15000, // 15 segundos
    maximumAge = 60000, // 1 minuto
    fallbackLocation = {
      lat: 1.2136,
      lng: -77.2811,
      address: 'Centro de Pasto, Nariño'
    },
    autoRetry = true,
    retryDelay = 3000,
    maxRetries = 3
  } = options;

  const [state, setState] = useState<GeolocationState>({
    location: null,
    status: 'loading',
    error: null,
    accuracy: null
  });

  const [retryCount, setRetryCount] = useState(0);

  // Función para verificar si estamos en contexto seguro
  const isSecureContext = useCallback(() => {
    return window.isSecureContext ||
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '127.0.0.1:3000';
  }, []);

  // Función para obtener ubicación con IP (fallback)
  const getLocationByIP = useCallback(async (): Promise<Location | null> => {
    const ipServices = [
      {
        name: 'ipapi.co',
        url: 'https://ipapi.co/json/',
        parser: (data: any) => ({
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
          address: `${data.city}, ${data.region}, ${data.country_name}`
        })
      },
      {
        name: 'ipinfo.io',
        url: 'https://ipinfo.io/json',
        parser: (data: any) => {
          const [lat, lng] = data.loc.split(',');
          return {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            address: `${data.city}, ${data.region}, ${data.country}`
          };
        }
      },
      {
        name: 'ip-api.com',
        url: 'http://ip-api.com/json/',
        parser: (data: any) => ({
          lat: data.lat,
          lng: data.lon,
          address: `${data.city}, ${data.regionName}, ${data.country}`
        })
      }
    ];

    for (const service of ipServices) {
      try {
        console.log(`🌐 Intentando ${service.name}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(service.url, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          const location = service.parser(data);
          
          if (location.lat && location.lng && !isNaN(location.lat) && !isNaN(location.lng)) {
            console.log(`✅ Ubicación obtenida por ${service.name}:`, location);
            return location;
          }
        }
      } catch (error) {
        console.log(`❌ Error con ${service.name}:`, error.message);
        continue;
      }
    }
    
    console.log('❌ Todos los servicios de IP fallaron');
    return null;
  }, []);

  // Función para obtener ubicación usando la API de timezone (otro fallback)
  const getLocationByTimezone = useCallback(async (): Promise<Location | null> => {
    try {
      console.log('🕐 Intentando ubicación por zona horaria...');
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('Zona horaria detectada:', timezone);
      
      // Mapeo básico de zonas horarias a ubicaciones aproximadas
      const timezoneMap: { [key: string]: Location } = {
        'America/Bogota': {
          lat: 1.2136,
          lng: -77.2811,
          address: 'Pasto, Nariño, Colombia (por zona horaria)'
        },
        'America/Lima': {
          lat: -12.0464,
          lng: -77.0428,
          address: 'Lima, Perú (por zona horaria)'
        },
        'America/Mexico_City': {
          lat: 19.4326,
          lng: -99.1332,
          address: 'Ciudad de México, México (por zona horaria)'
        },
        'America/Argentina/Buenos_Aires': {
          lat: -34.6118,
          lng: -58.3960,
          address: 'Buenos Aires, Argentina (por zona horaria)'
        }
      };
      
      if (timezoneMap[timezone]) {
        console.log('✅ Ubicación aproximada por zona horaria:', timezoneMap[timezone]);
        return timezoneMap[timezone];
      }
      
      // Si es zona horaria de Colombia, usar Pasto como aproximación
      if (timezone.includes('Bogota') || timezone.includes('America')) {
        const colombiaLocation: Location = {
          lat: 1.2136,
          lng: -77.2811,
          address: 'Pasto, Nariño, Colombia (por zona horaria)'
        };
        console.log('✅ Ubicación Colombia por zona horaria:', colombiaLocation);
        return colombiaLocation;
      }
      
    } catch (error) {
      console.log('❌ Error obteniendo ubicación por zona horaria:', error);
    }
    return null;
  }, []);

  // Función principal para obtener ubicación
  const getCurrentLocation = useCallback(async () => {
    console.log(`🚀 Obteniendo ubicación (intento ${retryCount + 1}/${maxRetries + 1})...`);
    
    setState(prev => ({ ...prev, status: 'loading', error: null }));

    // Verificar soporte de geolocalización
    if (!navigator.geolocation) {
      console.log('❌ Geolocalización no soportada');
      setState({
        location: fallbackLocation,
        status: 'error',
        error: 'Geolocalización no soportada por el navegador',
        accuracy: null
      });
      return;
    }

    // Verificar contexto seguro
    if (!isSecureContext()) {
      console.log('⚠️ Contexto no seguro, intentando ubicación por IP...');
      const ipLocation = await getLocationByIP();
      if (ipLocation) {
        setState({
          location: ipLocation,
          status: 'success',
          error: null,
          accuracy: null
        });
        return;
      } else {
        setState({
          location: fallbackLocation,
          status: 'error',
          error: 'Geolocalización requiere HTTPS. Usando ubicación por defecto.',
          accuracy: null
        });
        return;
      }
    }

    // Verificar permisos
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('📋 Estado del permiso:', permission.state);
        
        if (permission.state === 'denied') {
          console.log('🚫 Permisos denegados, intentando ubicación por IP...');
          const ipLocation = await getLocationByIP();
          if (ipLocation) {
            setState({
              location: ipLocation,
              status: 'success',
              error: 'Permisos GPS denegados. Usando ubicación aproximada.',
              accuracy: null
            });
            return;
          } else {
            setState({
              location: fallbackLocation,
              status: 'denied',
              error: 'Permisos de geolocalización denegados',
              accuracy: null
            });
            return;
          }
        }
      }

      // Función para obtener múltiples lecturas GPS y promediarlas
      const getMultipleGPSReadings = async (config: PositionOptions, readings: number = 3): Promise<GeolocationPosition> => {
        const positions: GeolocationPosition[] = [];
        
        for (let i = 0; i < readings; i++) {
          try {
            console.log(`📡 Lectura GPS ${i + 1}/${readings}...`);
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout lectura ${i + 1}`));
              }, config.timeout);

              navigator.geolocation.getCurrentPosition(
                (position) => {
                  clearTimeout(timeoutId);
                  resolve(position);
                },
                (error) => {
                  clearTimeout(timeoutId);
                  reject(error);
                },
                config
              );
            });
            
            positions.push(pos);
            console.log(`✅ Lectura ${i + 1}: precisión ${Math.round(pos.coords.accuracy)}m`);
            
            // Si obtenemos una lectura muy precisa, no necesitamos más
            if (pos.coords.accuracy < 50) {
              console.log('🎯 Precisión excelente obtenida, usando esta lectura');
              return pos;
            }
            
            // Pequeña pausa entre lecturas
            if (i < readings - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.log(`❌ Lectura ${i + 1} falló:`, error.message);
            if (positions.length === 0 && i === readings - 1) {
              throw error;
            }
          }
        }
        
        if (positions.length === 0) {
          throw new Error('No se pudieron obtener lecturas GPS');
        }
        
        // Usar la lectura más precisa
        const bestPosition = positions.reduce((best, current) => 
          current.coords.accuracy < best.coords.accuracy ? current : best
        );
        
        console.log(`🎯 Mejor lectura de ${positions.length}: precisión ${Math.round(bestPosition.coords.accuracy)}m`);
        return bestPosition;
      };

      // Intentar obtener ubicación GPS con múltiples configuraciones
      let position: GeolocationPosition | null = null;
      
      const gpsConfigs = [
        // Configuración de máxima precisión
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0 // Forzar nueva lectura
        },
        // Configuración de alta precisión con más tiempo
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 10000
        },
        // Configuración balanceada como último recurso
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000
        }
      ];

      for (let i = 0; i < gpsConfigs.length && !position; i++) {
        const config = gpsConfigs[i];
        console.log(`🛰️ Intento GPS ${i + 1}/3 (precisión: ${config.enableHighAccuracy ? 'alta' : 'normal'})...`);
        
        try {
          // Para la primera configuración (máxima precisión), intentar múltiples lecturas
          if (i === 0) {
            position = await getMultipleGPSReadings(config, 3);
          } else {
            // Para otras configuraciones, una sola lectura
            position = await new Promise<GeolocationPosition>((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout GPS ${i + 1}`));
              }, config.timeout);

              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  clearTimeout(timeoutId);
                  resolve(pos);
                },
                (err) => {
                  clearTimeout(timeoutId);
                  reject(err);
                },
                config
              );
            });
          }
          
          if (position) {
            console.log(`✅ GPS exitoso en intento ${i + 1}`);
            break;
          }
        } catch (gpsError) {
          console.log(`❌ GPS intento ${i + 1} falló:`, gpsError.message);
          if (i === gpsConfigs.length - 1) {
            throw gpsError;
          }
        }
      }

      // Verificar precisión antes de aceptar la ubicación GPS
      const accuracy = position.coords.accuracy;
      console.log(`📍 Precisión GPS: ${accuracy} metros`);

      // Si la precisión es muy mala (>1000m), rechazar y usar fallback
      if (accuracy > 1000) {
        console.log('⚠️ Precisión GPS muy baja, buscando alternativas...');
        throw new Error(`Precisión GPS insuficiente: ${accuracy}m`);
      }

      // Si la precisión es moderada (100-1000m), advertir pero aceptar
      if (accuracy > 100) {
        console.log('⚠️ Precisión GPS moderada, pero aceptable');
      }

      // Éxito - ubicación GPS obtenida con precisión aceptable
      const location: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        address: `Tu ubicación actual (GPS ±${Math.round(accuracy)}m)`
      };

      console.log('✅ Ubicación GPS obtenida:', location);

      setState({
        location,
        status: 'success',
        error: null,
        accuracy: position.coords.accuracy
      });

    } catch (error: any) {
      console.log('❌ Error GPS:', error.message);

      // Intentar múltiples fallbacks en orden
      console.log('🔄 GPS falló, probando fallbacks...');
      
      // 1. Intentar ubicación por IP
      let fallbackLocation = await getLocationByIP();
      
      // 2. Si IP falla, intentar por zona horaria
      if (!fallbackLocation) {
        fallbackLocation = await getLocationByTimezone();
      }
      
      // 3. Si encontramos ubicación alternativa
      if (fallbackLocation) {
        setState({
          location: fallbackLocation,
          status: 'success',
          error: `GPS no disponible: ${error.message}. Usando ubicación aproximada.`,
          accuracy: null
        });
        return;
      }

      // 4. Si todo falla, reintentar o usar ubicación por defecto
      if (autoRetry && retryCount < maxRetries) {
        console.log(`🔄 Reintentando en ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, retryDelay);
      } else {
        console.log('📍 Usando ubicación por defecto final');
        setState({
          location: fallbackLocation,
          status: 'error',
          error: `No se pudo obtener ubicación después de ${maxRetries + 1} intentos: ${error.message}`,
          accuracy: null
        });
      }
    }
  }, [
    enableHighAccuracy,
    timeout,
    maximumAge,
    fallbackLocation,
    autoRetry,
    retryDelay,
    maxRetries,
    retryCount,
    isSecureContext,
    getLocationByIP
  ]);

  // Función para reintentar manualmente
  const retry = useCallback(() => {
    setRetryCount(0);
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Efecto para inicializar y reintentar
  useEffect(() => {
    getCurrentLocation();
  }, [retryCount]);

  return {
    ...state,
    retry,
    isSecureContext: isSecureContext(),
    retryCount
  };
};