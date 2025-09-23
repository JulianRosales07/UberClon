/**
 * Utilidades para probar la geolocalización en el frontend
 */

import GeolocationService from '../services/GeolocationService';

export class GeolocationTester {
  private geolocationService: GeolocationService;

  constructor() {
    this.geolocationService = new GeolocationService();
  }

  /**
   * Probar si la geolocalización está disponible
   */
  async testGeolocationSupport(): Promise<boolean> {
    if (!navigator.geolocation) {
      console.error('❌ Geolocalización no soportada en este navegador');
      return false;
    }
    
    console.log('✅ Geolocalización soportada');
    return true;
  }

  /**
   * Probar obtención de ubicación actual
   */
  async testGetCurrentLocation(): Promise<any> {
    console.log('🧪 Probando obtención de ubicación actual...');
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      console.log('✅ Ubicación obtenida:', location);
      return location;
    } catch (error: any) {
      console.error('❌ Error obteniendo ubicación:', error.message);
      throw error;
    }
  }

  /**
   * Probar conexión con el backend
   */
  async testBackendConnection(): Promise<boolean> {
    console.log('🧪 Probando conexión con backend...');
    
    try {
      const response = await fetch('/api/health');
      
      if (response.ok) {
        console.log('✅ Backend conectado');
        return true;
      } else {
        console.error('❌ Backend respondió con error:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ No se pudo conectar al backend:', error);
      return false;
    }
  }

  /**
   * Probar API de ubicación actual
   */
  async testCurrentLocationAPI(): Promise<any> {
    console.log('🧪 Probando API de ubicación actual...');
    
    try {
      // Usar coordenadas de Times Square para prueba
      const testLocation = {
        lat: 40.7580,
        lng: -73.9855,
        accuracy: 10
      };

      const response = await this.geolocationService.reverseGeocode(testLocation);

      console.log('✅ API de ubicación funcionando:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en API de ubicación:', error);
      throw error;
    }
  }

  /**
   * Probar búsqueda de lugares
   */
  async testPlaceSearch(): Promise<any> {
    console.log('🧪 Probando búsqueda de lugares...');
    
    try {
      const results = await this.geolocationService.searchPlaces('Central Park');
      console.log('✅ Búsqueda de lugares funcionando:', results);
      return results;
    } catch (error) {
      console.error('❌ Error en búsqueda de lugares:', error);
      throw error;
    }
  }

  /**
   * Probar autocompletado
   */
  async testAutocomplete(): Promise<any> {
    console.log('🧪 Probando autocompletado...');
    
    try {
      const suggestions = await this.geolocationService.getAutocompleteSuggestions('Times');
      console.log('✅ Autocompletado funcionando:', suggestions);
      return suggestions;
    } catch (error) {
      console.error('❌ Error en autocompletado:', error);
      throw error;
    }
  }

  /**
   * Ejecutar todas las pruebas
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Iniciando pruebas de geolocalización...\n');
    
    const results = {
      geolocationSupport: false,
      backendConnection: false,
      currentLocation: null,
      locationAPI: null,
      placeSearch: null,
      autocomplete: null
    };

    try {
      // Test 1: Soporte de geolocalización
      results.geolocationSupport = await this.testGeolocationSupport();
      
      // Test 2: Conexión con backend
      results.backendConnection = await this.testBackendConnection();
      
      if (!results.backendConnection) {
        console.log('\n❌ No se pueden ejecutar más pruebas sin conexión al backend');
        return;
      }

      // Test 3: Obtener ubicación actual (opcional, requiere permisos)
      try {
        results.currentLocation = await this.testGetCurrentLocation();
      } catch (error) {
        console.log('⚠️ No se pudo obtener ubicación actual (normal si no hay permisos)');
      }

      // Test 4: API de ubicación
      results.locationAPI = await this.testCurrentLocationAPI();

      // Test 5: Búsqueda de lugares
      results.placeSearch = await this.testPlaceSearch();

      // Test 6: Autocompletado
      results.autocomplete = await this.testAutocomplete();

      // Resumen
      console.log('\n📊 RESUMEN DE PRUEBAS:');
      console.log('✅ Geolocalización soportada:', results.geolocationSupport);
      console.log('✅ Backend conectado:', results.backendConnection);
      console.log('✅ Ubicación actual:', !!results.currentLocation);
      console.log('✅ API de ubicación:', !!results.locationAPI);
      console.log('✅ Búsqueda de lugares:', !!results.placeSearch);
      console.log('✅ Autocompletado:', !!results.autocomplete);

      console.log('\n🎉 Pruebas completadas exitosamente!');

    } catch (error) {
      console.error('\n❌ Error en las pruebas:', error);
    }
  }

  /**
   * Probar con ubicación mock
   */
  async testWithMockLocation(lat: number, lng: number): Promise<void> {
    console.log(`🧪 Probando con ubicación mock: ${lat}, ${lng}`);
    
    try {
      const locationInfo = await this.geolocationService.reverseGeocode({ lat, lng });
      console.log('✅ Información de ubicación mock:', locationInfo);
      
      // Mostrar información relevante
      console.log('📍 Dirección:', locationInfo);
    } catch (error) {
      console.error('❌ Error con ubicación mock:', error);
    }
  }
}

// Función helper para usar en la consola del navegador
export const testGeolocation = () => {
  const tester = new GeolocationTester();
  return tester.runAllTests();
};

// Función helper para probar ubicaciones específicas
export const testLocation = (lat: number, lng: number) => {
  const tester = new GeolocationTester();
  return tester.testWithMockLocation(lat, lng);
};

// Exportar para uso global en desarrollo
if (process.env.NODE_ENV === 'development') {
  (window as any).testGeolocation = testGeolocation;
  (window as any).testLocation = testLocation;
  (window as any).GeolocationTester = GeolocationTester;
}