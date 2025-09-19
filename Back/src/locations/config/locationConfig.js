/**
 * Configuración para el módulo de ubicaciones
 */

const locationConfig = {
  // Configuración de la API de Nominatim
  nominatim: {
    baseUrl: 'https://nominatim.openstreetmap.org',
    userAgent: 'UberClone/1.0',
    defaultLimit: 5,
    maxLimit: 20,
    // Tiempo de espera entre peticiones (en ms) para respetar rate limiting
    rateLimitDelay: 1000
  },

  // Configuración de búsqueda
  search: {
    defaultLimit: 5,
    maxLimit: 20,
    minQueryLength: 2,
    // Tipos de lugares a incluir en las búsquedas
    allowedTypes: [
      'house',
      'building',
      'residential',
      'commercial',
      'retail',
      'office',
      'industrial',
      'public',
      'amenity',
      'leisure',
      'tourism',
      'shop',
      'restaurant',
      'hotel'
    ]
  },

  // Configuración de distancias
  distance: {
    // Radio de la Tierra en kilómetros
    earthRadius: 6371,
    // Distancia máxima para búsquedas cercanas (en km)
    maxNearbyDistance: 50,
    // Precisión decimal para coordenadas
    coordinatePrecision: 6
  },

  // Configuración de cache
  cache: {
    // Tiempo de vida del cache en segundos (24 horas)
    ttl: 24 * 60 * 60,
    // Número máximo de ubicaciones en cache
    maxEntries: 10000,
    // Distancia mínima para considerar dos ubicaciones como diferentes (en metros)
    minDistanceThreshold: 100
  },

  // Configuración de validación
  validation: {
    // Límites de coordenadas
    latitude: {
      min: -90,
      max: 90
    },
    longitude: {
      min: -180,
      max: 180
    },
    // Longitud mínima y máxima para queries de búsqueda
    queryLength: {
      min: 2,
      max: 200
    }
  },

  // Mensajes de error
  errorMessages: {
    invalidQuery: 'El parámetro de búsqueda debe tener al menos 2 caracteres',
    invalidCoordinates: 'Las coordenadas proporcionadas no son válidas',
    invalidLimit: 'El límite debe ser un número entre 1 y 20',
    apiError: 'Error al conectar con el servicio de mapas',
    notFound: 'No se encontraron ubicaciones para la búsqueda',
    rateLimitExceeded: 'Se ha excedido el límite de peticiones. Intente nuevamente en unos segundos'
  },

  // Configuración de países soportados (opcional)
  supportedCountries: [
    'PE', 'CO', 'CL', 'AR', 'BR', 'MX', 'US', 'ES'
  ],

  // Configuración de idiomas
  languages: {
    default: 'es',
    supported: ['es', 'en', 'pt']
  }
};

module.exports = locationConfig;