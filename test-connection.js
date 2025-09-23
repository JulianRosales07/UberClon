const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testConnection() {
  console.log('🧪 Probando conexión Frontend-Backend...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Probando health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test 2: API info
    console.log('\n2️⃣ Probando información de API...');
    const infoResponse = await axios.get(`${API_BASE_URL}/info`);
    console.log('✅ API Info:', infoResponse.data.data.name);

    // Test 3: Búsqueda de ubicaciones
    console.log('\n3️⃣ Probando búsqueda de ubicaciones...');
    const searchResponse = await axios.get(`${API_BASE_URL}/locations-test/search`, {
      params: { query: 'Pasto', limit: 3 }
    });
    console.log('✅ Búsqueda de ubicaciones:', searchResponse.data.data.length, 'resultados');
    console.log('   Primer resultado:', searchResponse.data.data[0]?.display_name);

    // Test 4: Geocodificación inversa
    console.log('\n4️⃣ Probando geocodificación inversa...');
    const reverseResponse = await axios.get(`${API_BASE_URL}/locations-test/details/1.223789/-77.283255`);
    console.log('✅ Geocodificación inversa:', reverseResponse.data.data?.display_name);

    // Test 5: Cálculo de distancia
    console.log('\n5️⃣ Probando cálculo de distancia...');
    const distanceResponse = await axios.post(`${API_BASE_URL}/locations-test/distance`, {
      from: { lat: 1.223789, lon: -77.283255 },
      to: { lat: 1.216386, lon: -77.288671 }
    });
    console.log('✅ Cálculo de distancia:', distanceResponse.data.data.distance, 'km');

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('🔗 La conexión Frontend-Backend está funcionando correctamente.');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Asegúrate de que el backend esté ejecutándose en http://localhost:3001');
    }
  }
}

// Ejecutar pruebas
testConnection();