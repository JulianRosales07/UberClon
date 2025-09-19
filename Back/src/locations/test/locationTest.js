const LocationService = require('../services/LocationService');

/**
 * Script de prueba para el servicio de ubicaciones
 * Ejecutar con: node src/locations/test/locationTest.js
 */

async function testLocationService() {
  console.log('🧪 Iniciando pruebas del servicio de ubicaciones...\n');

  try {
    // Prueba 1: Buscar ubicaciones
    console.log('1️⃣ Probando búsqueda de ubicaciones...');
    const searchResults = await LocationService.searchLocations('Plaza de Armas Lima', 3);
    console.log(`✅ Encontradas ${searchResults.length} ubicaciones:`);
    searchResults.forEach((location, index) => {
      console.log(`   ${index + 1}. ${location.display_name}`);
      console.log(`      Coordenadas: ${location.lat}, ${location.lon}`);
    });
    console.log('');

    // Prueba 2: Geocodificación inversa
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      console.log('2️⃣ Probando geocodificación inversa...');
      const reverseResult = await LocationService.reverseGeocode(firstResult.lat, firstResult.lon);
      console.log(`✅ Dirección encontrada: ${reverseResult.display_name}`);
      console.log('');
    }

    // Prueba 3: Cálculo de distancia
    console.log('3️⃣ Probando cálculo de distancia...');
    const distance = LocationService.calculateDistance(
      -12.0464, -77.0428, // Plaza de Armas Lima (aprox)
      -12.0500, -77.0450  // Punto cercano
    );
    console.log(`✅ Distancia calculada: ${distance} km`);
    console.log('');

    // Prueba 4: Validación de coordenadas
    console.log('4️⃣ Probando validación de coordenadas...');
    const validCoords = LocationService.validateCoordinates(-12.0464, -77.0428);
    const invalidCoords = LocationService.validateCoordinates(100, 200);
    console.log(`✅ Coordenadas válidas (-12.0464, -77.0428): ${validCoords}`);
    console.log(`✅ Coordenadas inválidas (100, 200): ${invalidCoords}`);
    console.log('');

    console.log('🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas si el archivo se ejecuta directamente
if (require.main === module) {
  testLocationService();
}

module.exports = { testLocationService };