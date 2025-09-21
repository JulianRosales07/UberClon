const express = require('express');
const {
  createTripRequest,
  getTripsByPassenger,
  getAvailableTrips,
  acceptTrip,
  startTrip,
  completeTrip,
  cancelTrip,
  getTripById
} = require('../controllers/TripController');
const { validateTrip } = require('../../shared/middleware/validators');
const { authenticateToken, requireRole } = require('../../shared/middleware/auth');

const router = express.Router();

// Rutas generales (pasajeros y conductores)
router.get('/:id', authenticateToken, getTripById);
router.put('/:id/cancel', authenticateToken, cancelTrip);

// Rutas para pasajeros
router.post('/', authenticateToken, validateTrip, createTripRequest);
router.get('/passenger/my-trips', authenticateToken, getTripsByPassenger);

// Rutas para conductores
router.get('/driver/available', authenticateToken, requireRole('driver'), getAvailableTrips);
router.put('/:id/accept', authenticateToken, requireRole('driver'), acceptTrip);
router.put('/:id/start', authenticateToken, requireRole('driver'), startTrip);
router.put('/:id/complete', authenticateToken, requireRole('driver'), completeTrip);

module.exports = router;