const express = require('express');
const authRoutes = require('../auth/routes/authRoutes');
const tripRoutes = require('../trips/routes/tripRoutes');
const driverRoutes = require('../drivers/routes/driverRoutes');
const paymentRoutes = require('../payments/routes/paymentRoutes');
// const locationRoutes = require('../locations/routes/locationRoutes');
const locationRoutesNoMongo = require('../locations/routes/locationRoutesNoMongo');
const locationTestRoutes = require('../locations/routes/locationTestRoutes');

const router = express.Router();

// Rutas de la API
router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);
router.use('/drivers', driverRoutes);
router.use('/payments', paymentRoutes);
// router.use('/locations', locationRoutes);
router.use('/locations', locationRoutesNoMongo);
router.use('/locations-test', locationTestRoutes);

// Ruta de salud de la API
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta para información de la API
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Travel Service API',
      version: '1.0.0',
      description: 'API para sistema de solicitud de carreras y servicios de viajes',
      endpoints: {
        auth: '/api/auth',
        trips: '/api/trips',
        drivers: '/api/drivers',
        payments: '/api/payments',
        locations: '/api/locations',
        'locations-test': '/api/locations-test'
      }
    }
  });
});

module.exports = router;

