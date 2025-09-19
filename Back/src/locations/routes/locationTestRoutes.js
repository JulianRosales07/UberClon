const express = require('express');
const LocationController = require('../controllers/LocationController');

const router = express.Router();

/**
 * Rutas de prueba para ubicaciones SIN autenticación
 * Solo para testing cuando MongoDB no está disponible
 */

// Crear versiones de los controladores sin autenticación
class LocationTestController {
  static async searchLocations(req, res) {
    // Simular usuario autenticado
    req.user = { userId: 'test-user', role: 'passenger' };
    return LocationController.searchLocations(req, res);
  }

  static async getLocationDetails(req, res) {
    req.user = { userId: 'test-user', role: 'passenger' };
    return LocationController.getLocationDetails(req, res);
  }

  static async calculateDistance(req, res) {
    req.user = { userId: 'test-user', role: 'passenger' };
    return LocationController.calculateDistance(req, res);
  }
}

/**
 * @route GET /api/locations-test/search
 * @desc Buscar ubicaciones por texto (SIN AUTH)
 */
router.get('/search', LocationTestController.searchLocations);

/**
 * @route GET /api/locations-test/details/:lat/:lon
 * @desc Obtener detalles de una ubicación por coordenadas (SIN AUTH)
 */
router.get('/details/:lat/:lon', LocationTestController.getLocationDetails);

/**
 * @route POST /api/locations-test/distance
 * @desc Calcular distancia entre dos puntos (SIN AUTH)
 */
router.post('/distance', LocationTestController.calculateDistance);

module.exports = router;