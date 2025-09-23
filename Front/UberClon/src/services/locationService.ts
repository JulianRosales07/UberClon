import apiClient from './apiService';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  place_id?: string;
  display_name?: string;
  type?: string;
  importance?: number;
}

export interface LocationSearchResult {
  place_id: string;
  display_name: string;
  lat: number;
  lon: number;
  type: string;
  importance: number;
  address: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

export interface DistanceCalculation {
  distance: number;
  estimatedTime: number;
  estimatedFare: number;
}

export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback a Pasto si no hay geolocalización
      resolve({
        lat: 1.223789,
        lng: -77.283255,
        address: 'Centro de Pasto, Nariño'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Intentar obtener la dirección usando geocodificación inversa
          const locationDetails = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );

          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: locationDetails.display_name || 'Tu ubicación actual'
          });
        } catch (error) {
          // Si falla la geocodificación, usar coordenadas sin dirección
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Tu ubicación actual'
          });
        }
      },
      (error) => {
        console.warn('Error obteniendo ubicación:', error);
        // Fallback a Pasto
        resolve({
          lat: 1.223789,
          lng: -77.283255,
          address: 'Centro de Pasto, Nariño'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
};

export const searchLocations = async (query: string, limit: number = 5): Promise<Location[]> => {
  try {
    const response = await apiClient.get('/locations-test/search', {
      params: { query, limit }
    });

    if (response.data.success && response.data.data) {
      return response.data.data.map((location: LocationSearchResult) => ({
        lat: location.lat,
        lng: location.lon,
        address: location.display_name,
        place_id: location.place_id,
        display_name: location.display_name,
        type: location.type,
        importance: location.importance
      }));
    }

    // Fallback a ubicaciones locales de Pasto si la API falla
    return getPastoLocations(query);
  } catch (error) {
    console.warn('Error buscando ubicaciones en API, usando fallback:', error);
    return getPastoLocations(query);
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<LocationSearchResult> => {
  try {
    const response = await apiClient.get(`/locations-test/details/${lat}/${lng}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error('No se pudo obtener información de la ubicación');
  } catch (error) {
    console.warn('Error en geocodificación inversa:', error);
    throw error;
  }
};

export const calculateDistance = async (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<DistanceCalculation> => {
  try {
    const response = await apiClient.post('/locations-test/distance', {
      from: { lat: fromLat, lon: fromLng },
      to: { lat: toLat, lon: toLng }
    });

    if (response.data.success && response.data.data) {
      const distance = response.data.data.distance;
      return {
        distance,
        estimatedTime: Math.ceil(distance * 2), // 2 minutos por km aproximadamente
        estimatedFare: Math.ceil(distance * 2500) // $2500 por km base
      };
    }

    throw new Error('No se pudo calcular la distancia');
  } catch (error) {
    console.warn('Error calculando distancia, usando estimación local:', error);
    // Fallback a cálculo local
    const distance = calculateDistanceLocal(fromLat, fromLng, toLat, toLng);
    return {
      distance,
      estimatedTime: Math.ceil(distance * 2),
      estimatedFare: Math.ceil(distance * 2500)
    };
  }
};

// Función auxiliar para ubicaciones locales de Pasto
const getPastoLocations = (query: string): Location[] => {
  const pastoLocations = [
    { lat: 1.216386, lng: -77.288671, address: 'Centro Comercial Unicentro, Pasto' },
    { lat: 1.226829, lng: -77.282465, address: 'Avenida de los Estudiantes, Pasto' },
    { lat: 1.223802, lng: -77.283742, address: 'Universidad Mariana, Pasto' },
    { lat: 1.205879, lng: -77.260628, address: 'Centro Comercial Único, Pasto' },
    { lat: 1.204400, lng: -77.293005, address: 'Tamasagra, Pasto' },
    { lat: 1.198087, lng: -77.278660, address: 'Estadio Libertad, Pasto' },
    { lat: 1.218915, lng: -77.281944, address: 'Parque Infantil, Pasto' },
    { lat: 1.220019, lng: -77.298537, address: 'Alvernia, Pasto' },
    { lat: 1.223789, lng: -77.283255, address: 'Centro de Pasto, Nariño' },
    { lat: 1.214567, lng: -77.275432, address: 'Terminal de Transportes, Pasto' }
  ];

  return pastoLocations.filter(location =>
    location.address.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);
};

// Cálculo local de distancia usando fórmula de Haversine
const calculateDistanceLocal = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};