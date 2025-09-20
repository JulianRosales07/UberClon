const express = require('express');
const {
  updateDriverStatus,
  updateDriverLocation,
  getDriverStats,
  getDriverTrips,
  registerVehicle,
  updateVehicle,
  getNearbyDrivers
} = require('../controllers/DriverController');
const { validateVehicle } = require('../../shared/middleware/validators');
const { authenticateToken, requireRole } = require('../../shared/middleware/auth');

const router = express.Router();

// Rutas que requieren autenticación y rol de conductor
router.put('/status', authenticateToken, requireRole('driver'), updateDriverStatus);
router.put('/location', authenticateToken, requireRole('driver'), updateDriverLocation);
router.get('/stats', authenticateToken, requireRole('driver'), getDriverStats);
router.get('/trips', authenticateToken, requireRole('driver'), getDriverTrips);

// Rutas de vehículos
router.post('/vehicle', authenticateToken, requireRole('driver'), validateVehicle, registerVehicle);
router.put('/vehicle/:vehicleId', authenticateToken, requireRole('driver'), updateVehicle);

// Ruta pública para obtener conductores cercanos (solo requiere autenticación)
router.get('/nearby', authenticateToken, getNearbyDrivers);

module.exports = router;