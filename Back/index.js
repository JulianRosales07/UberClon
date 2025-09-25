require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./src/routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

console.log('🚀 Iniciando servidor UberClon Backend...');

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
    message: 'UberClon API - Servidor Principal',
    version: '1.0.0',
    documentation: '/api/info',
    endpoints: {
      locations: '/api/locations-test/search?query=Pasto',
      distance: '/api/locations-test/distance',
      details: '/api/locations-test/details/1.223789/-77.283255'
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

// Configurar Socket.IO
require('./src/shared/socketService')(io);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`✅ UberClon Backend ejecutándose en puerto ${PORT}`);
  console.log(`📍 API disponible en: http://localhost:${PORT}`);
  console.log(`📖 Documentación: http://localhost:${PORT}/api/info`);
  console.log(`🌍 Frontend esperado en: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔌 WebSocket habilitado para notificaciones en tiempo real`);
});

module.exports = { app, server, io };