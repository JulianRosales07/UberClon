const axios = require('axios');
const locationConfig = require('../config/locationConfig');

class LocationService {
  static NOMINATIM_BASE_URL = locationConfig.nominatim.baseUrl;

  /**
   * Buscar ubicaciones usando la API de Nominatim
   */
  static async searchLocations(query, limit = 5) {
    try {
      const params = {
        q: query,
        format: 'json',
        limit: limit,
        addressdetails: 1,
        extratags: 1,
        namedetails: 1
      };

      const response = await axios.get(`${this.NOMINATIM_BASE_URL}/search`, {
        params,
        headers: {
          'User-Agent': locationConfig.nominatim.userAgent
        }
      });

      return response.data.map(location => ({
        place_id: location.place_id,
        display_name: location.display_name,
        lat: parseFloat(location.lat),
        lon: parseFloat(location.lon),
        type: location.type,
        importance: location.importance,
        address: {
          house_number: location.address?.house_number,
          road: location.address?.road,
          neighbourhood: location.address?.neighbourhood,
          suburb: location.address?.suburb,
          city: location.address?.city || location.address?.town || location.address?.village,
          state: location.address?.state,
          postcode: location.address?.postcode,
          country: location.address?.country,
          country_code: location.address?.country_code
        }
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      throw new Error('Error al buscar ubicaciones');
    }
  }

  /**
   * Geocodificación inversa - obtener dirección desde coordenadas
   */
  static async reverseGeocode(lat, lon) {
    try {
      const params = {
        lat: lat,
        lon: lon,
        format: 'json',
        addressdetails: 1,
        extratags: 1,
        namedetails: 1
      };

      const response = await axios.get(`${this.NOMINATIM_BASE_URL}/reverse`, {
        params,
        headers: {
          'User-Agent': locationConfig.nominatim.userAgent
        }
      });

      const location = response.data;
      
      return {
        place_id: location.place_id,
        display_name: location.display_name,
        lat: parseFloat(location.lat),
        lon: parseFloat(location.lon),
        type: location.type,
        address: {
          house_number: location.address?.house_number,
          road: location.address?.road,
          neighbourhood: location.address?.neighbourhood,
          suburb: location.address?.suburb,
          city: location.address?.city || location.address?.town || location.address?.village,
          state: location.address?.state,
          postcode: location.address?.postcode,
          country: location.address?.country,
          country_code: location.address?.country_code
        }
      };
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      throw new Error('Error al obtener detalles de la ubicación');
    }
  }

  /**
   * Calcular distancia entre dos puntos usando la fórmula de Haversine
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = locationConfig.distance.earthRadius;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Convertir grados a radianes
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Validar coordenadas
   */
  static validateCoordinates(lat, lon) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return false;
    }
    
    if (latitude < -90 || latitude > 90) {
      return false;
    }
    
    if (longitude < -180 || longitude > 180) {
      return false;
    }
    
    return true;
  }
}

module.exports = LocationService;