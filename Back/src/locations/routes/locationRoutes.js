const express = require('express');
const LocationController = require('../controllers/LocationController');
const { authenticateToken } = require('../../shared/middleware/auth');

const router = express.Router();

/**
 * @route GET /api/locations/search
 * @desc Buscar ubicaciones por texto
 * @access Private
 * @param {string} query - Texto a buscar
 * @param {number} limit - Límite de resultados (opcional, default: 5)
 */
router.get('/search', authenticateToken, LocationController.searchLocations);

/**
 * @route GET /api/locations/details/:lat/:lon
 * @desc Obtener detalles de una ubicación por coordenadas
 * @access Private
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 */
router.get('/details/:lat/:lon', authenticateToken, LocationController.getLocationDetails);

/**
 * @route POST /api/locations/distance
 * @desc Calcular distancia entre dos puntos
 * @access Private
 * @body {number} originLat - Latitud de origen
 * @body {number} originLon - Longitud de origen
 * @body {number} destLat - Latitud de destino
 * @body {number} destLon - Longitud de destino
 */
router.post('/distance', authenticateToken, LocationController.calculateDistance);

module.exports = router;