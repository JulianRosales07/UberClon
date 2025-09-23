require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;

console.log('🚀 Iniciando servidor simple UberClon...');

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'UberClon API Simple - Funcionando',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      search: '/api/locations-test/search?query=Pasto',
      distance: '/api/locations-test/distance'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Búsqueda de ubicaciones usando Nominatim
app.get('/api/locations-test/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro query es requerido'
      });
    }

    console.log(`Buscando ubicaciones para: ${query}`);

    // Usar Nominatim API
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: limit,
        addressdetails: 1,
        extratags: 1,
        namedetails: 1
      },
      headers: {
        'User-Agent': 'UberClon/1.0.0'
      }
    });

    const locations = response.data.map(location => ({
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

    res.json({
      success: true,
      data: locations,
      count: locations.length
    });

  } catch (error) {
    console.error('Error buscando ubicaciones:', error.message);
    
    // Fallback a ubicaciones locales de Pasto
    const pastoLocations = [
      {
        place_id: '1',
        display_name: 'Centro Comercial Unicentro, Pasto, Nariño, Colombia',
        lat: 1.216386,
        lon: -77.288671,
        type: 'commercial',
        importance: 0.8
      },
      {
        place_id: '2',
        display_name: 'Universidad Mariana, Pasto, Nariño, Colombia',
        lat: 1.223802,
        lon: -77.283742,
        type: 'university',
        importance: 0.7
      },
      {
        place_id: '3',
        display_name: 'Centro de Pasto, Nariño, Colombia',
        lat: 1.223789,
        lon: -77.283255,
        type: 'city_center',
        importance: 0.9
      }
    ].filter(loc => 
      loc.display_name.toLowerCase().includes(req.query.query.toLowerCase())
    );

    res.json({
      success: true,
      data: pastoLocations,
      count: pastoLocations.length,
      fallback: true
    });
  }
});

// Geocodificación inversa
app.get('/api/locations-test/details/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    console.log(`Geocodificación inversa para: ${lat}, ${lon}`);

    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: lat,
        lon: lon,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'UberClon/1.0.0'
      }
    });

    const location = response.data;
    
    res.json({
      success: true,
      data: {
        place_id: location.place_id,
        display_name: location.display_name,
        lat: parseFloat(location.lat),
        lon: parseFloat(location.lon),
        type: location.type,
        address: location.address
      }
    });

  } catch (error) {
    console.error('Error en geocodificación inversa:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de la ubicación'
    });
  }
});

// Cálculo de distancia
app.post('/api/locations-test/distance', (req, res) => {
  try {
    const { from, to } = req.body;
    
    if (!from || !to || !from.lat || !from.lon || !to.lat || !to.lon) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas de origen y destino son requeridas'
      });
    }

    // Fórmula de Haversine
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRadians(to.lat - from.lat);
    const dLon = toRadians(to.lon - from.lon);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    res.json({
      success: true,
      data: {
        distance: Math.round(distance * 100) / 100,
        unit: 'km'
      }
    });

  } catch (error) {
    console.error('Error calculando distancia:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

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
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor simple ejecutándose en puerto ${PORT}`);
  console.log(`📍 API disponible en: http://localhost:${PORT}`);
  console.log(`🔍 Buscar ubicaciones: http://localhost:${PORT}/api/locations-test/search?query=Pasto`);
  console.log(`❤️ Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;