require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Iniciando servidor en modo de prueba (sin MongoDB)...');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Travel Service API - Modo de Prueba (sin MongoDB)',
    version: '1.0.0',
    documentation: '/api/info',
    testEndpoints: {
      locations: '/api/locations-test/search?query=Lima',
      distance: '/api/locations-test/distance',
      details: '/api/locations-test/details/-12.0464/-77.0428'
    }
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor de prueba ejecutándose en puerto ${PORT}`);
  console.log(`📍 Endpoints de ubicaciones disponibles:`);
  console.log(`   - GET  http://localhost:${PORT}/api/locations-test/search?query=Lima`);
  console.log(`   - GET  http://localhost:${PORT}/api/locations-test/details/-12.0464/-77.0428`);
  console.log(`   - POST http://localhost:${PORT}/api/locations-test/distance`);
  console.log(`📖 Documentación: http://localhost:${PORT}/api/info`);
});

module.exports = app;