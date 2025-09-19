require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');

/**
 * Script para probar los endpoints de ubicaciones con un token válido
 */

// Generar un token de prueba
function generateTestToken() {
  const payload = {
    userId: '507f1f77bcf86cd799439011', // ObjectId de prueba
    role: 'passenger'
  };
  
  // Usar la misma clave que el servidor
  const secret = process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro_aqui_cambialo_en_produccion';
  
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

async function testLocationEndpoints() {
  const baseUrl = 'http://localhost:3000/api/locations';
  const token = generateTestToken();
  
  console.log('🔑 Token generado para pruebas');
  console.log('🧪 Probando endpoints de ubicaciones...\n');

  try {
    // Prueba 1: Buscar ubicaciones
    console.log('1️⃣ Probando búsqueda de ubicaciones...');
    const searchResponse = await axios.get(`${baseUrl}/search`, {
      params: { query: 'Miraflores Lima', limit: 3 },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Encontradas ${searchResponse.data.data.length} ubicaciones:`);
    searchResponse.data.data.forEach((loc, i) => {
      console.log(`   ${i + 1}. ${loc.display_name}`);
    });
    console.log('');

    // Prueba 2: Calcular distancia
    console.log('2️⃣ Probando cálculo de distancia...');
    const distanceResponse = await axios.post(`${baseUrl}/distance`, {
      originLat: -12.0464,
      originLon: -77.0428,
      destLat: -12.1200,
      destLon: -77.0300
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Distancia: ${distanceResponse.data.data.distance} ${distanceResponse.data.data.unit}`);
    console.log('');

    console.log('🎉 Todas las pruebas de endpoints completadas exitosamente!');

  } catch (error) {
    if (error.response) {
      console.error('❌ Error en la respuesta:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

if (require.main === module) {
  testLocationEndpoints();
}

module.exports = { testLocationEndpoints, generateTestToken };