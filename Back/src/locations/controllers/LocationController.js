const LocationService = require('../services/LocationService');

class LocationController {
  /**
   * Buscar ubicaciones por texto
   */
  static async searchLocations(req, res) {
    try {
      const { query, limit = 5 } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro query es requerido'
        });
      }

      const locations = await LocationService.searchLocations(query, limit);
      
      res.json({
        success: true,
        data: locations
      });
    } catch (error) {
      console.error('Error searching locations:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener detalles de una ubicación específica
   */
  static async getLocationDetails(req, res) {
    try {
      const { lat, lon } = req.params;
      
      if (!lat || !lon) {
        return res.status(400).json({
          success: false,
          message: 'Latitud y longitud son requeridas'
        });
      }

      const location = await LocationService.reverseGeocode(lat, lon);
      
      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      console.error('Error getting location details:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Calcular distancia entre dos puntos
   */
  static async calculateDistance(req, res) {
    try {
      const { originLat, originLon, destLat, destLon } = req.body;
      
      if (!originLat || !originLon || !destLat || !destLon) {
        return res.status(400).json({
          success: false,
          message: 'Coordenadas de origen y destino son requeridas'
        });
      }

      const distance = LocationService.calculateDistance(
        originLat, originLon, destLat, destLon
      );
      
      res.json({
        success: true,
        data: {
          distance: distance,
          unit: 'km'
        }
      });
    } catch (error) {
      console.error('Error calculating distance:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = LocationController;