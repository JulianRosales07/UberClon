const express = require('express');
const {
  createPayment,
  getPaymentHistory,
  getDriverEarnings,
  refundPayment
} = require('../controllers/PaymentController');
const { validatePayment } = require('../../shared/middleware/validators');
const { authenticateToken, requireRole } = require('../../shared/middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para pasajeros y conductores
router.post('/', validatePayment, createPayment);
router.get('/history', getPaymentHistory);

// Rutas específicas para conductores
router.get('/earnings', requireRole('driver'), getDriverEarnings);

// Rutas para administradores (reembolsos)
router.post('/:id/refund', requireRole('admin'), refundPayment);

module.exports = router;
