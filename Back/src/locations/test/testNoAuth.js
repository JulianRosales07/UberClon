const axios = require('axios');

/**
 * Script para probar los endpoints de ubicaciones SIN autenticación
 */

async function testLocationEndpointsNoAuth() {
  const baseUrl = 'http://localhost:3000/api/locations-test';
  
  console.log('🧪 Probando endpoints de ubicaciones (sin autenticación)...\n');

  try {
    // Prueba 1: Buscar ubicaciones
    console.log('1️⃣ Probando búsqueda de ubicaciones...');
    const searchResponse = await axios.get(`${baseUrl}/search`, {
      params: { query: 'Miraflores Lima', limit: 3 }
    });
    
    console.log(`✅ Encontradas ${searchResponse.data.data.length} ubicaciones:`);
    searchResponse.data.data.forEach((loc, i) => {
      console.log(`   ${i + 1}. ${loc.display_name}`);
      console.log(`      Coordenadas: ${loc.lat}, ${loc.lon}`);
    });
    console.log('');

    // Prueba 2: Obtener detalles de ubicación
    if (searchResponse.data.data.length > 0) {
      const firstLocation = searchResponse.data.data[0];
      console.log('2️⃣ Probando obtener detalles de ubicación...');
      const detailsResponse = await axios.get(
        `${baseUrl}/details/${firstLocation.lat}/${firstLocation.lon}`
      );
      
      console.log(`✅ Detalles: ${detailsResponse.data.data.display_name}`);
      console.log(`   Ciudad: ${detailsResponse.data.data.address.city}`);
      console.log(`   País: ${detailsResponse.data.data.address.country}`);
      console.log('');
    }

    // Prueba 3: Calcular distancia
    console.log('3️⃣ Probando cálculo de distancia...');
    const distanceResponse = await axios.post(`${baseUrl}/distance`, {
      originLat: -12.0464,
      originLon: -77.0428,
      destLat: -12.1200,
      destLon: -77.0300
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`✅ Distancia: ${distanceResponse.data.data.distance} ${distanceResponse.data.data.unit}`);
    console.log('');

    console.log('🎉 Todas las pruebas completadas exitosamente!');
    console.log('📝 Los endpoints están funcionando correctamente con la API de Nominatim');

  } catch (error) {
    if (error.response) {
      console.error('❌ Error en la respuesta:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      console.error('❌ Error de conexión:', error.message);
      console.error('¿Está el servidor ejecutándose en http://localhost:3000?');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

if (require.main === module) {
  testLocationEndpointsNoAuth();
}

module.exports = { testLocationEndpointsNoAuth };