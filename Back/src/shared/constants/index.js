// Estados de viajes
const TRIP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Tipos de viajes
const TRIP_TYPES = {
  STANDARD: 'standard',
  PREMIUM: 'premium',
  SHARED: 'shared'
};

// Roles de usuario
const USER_ROLES = {
  PASSENGER: 'passenger',
  DRIVER: 'driver',
  ADMIN: 'admin'
};

// Estados de pago
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Métodos de pago
const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  DIGITAL_WALLET: 'digital_wallet'
};

// Tipos de vehículos
const VEHICLE_TYPES = {
  SEDAN: 'sedan',
  SUV: 'suv',
  HATCHBACK: 'hatchback',
  PICKUP: 'pickup',
  VAN: 'van',
  MOTORCYCLE: 'motorcycle'
};

// Características de vehículos
const VEHICLE_FEATURES = {
  AIR_CONDITIONING: 'air_conditioning',
  BLUETOOTH: 'bluetooth',
  GPS: 'gps',
  CHILD_SEAT: 'child_seat',
  WHEELCHAIR_ACCESSIBLE: 'wheelchair_accessible',
  PET_FRIENDLY: 'pet_friendly'
};

// Configuración de precios
const PRICING_CONFIG = {
  MINIMUM_FARE: 5.0,
  PLATFORM_FEE_PERCENTAGE: 20,
  BASE_PRICES: {
    [TRIP_TYPES.STANDARD]: 2.5,
    [TRIP_TYPES.PREMIUM]: 4.0,
    [TRIP_TYPES.SHARED]: 1.8
  },
  TIME_MULTIPLIERS: {
    NORMAL: 1.0,
    PEAK: 1.5,
    NIGHT: 1.2
  },
  SURGE_MULTIPLIERS: {
    LOW: 0.8,
    NORMAL: 1.0,
    HIGH: 1.3,
    VERY_HIGH: 1.6,
    EXTREME: 2.0
  }
};

// Configuración de distancias
const DISTANCE_CONFIG = {
  MAX_TRIP_DISTANCE: 100, // km
  MAX_SEARCH_RADIUS: 50, // km
  DEFAULT_SEARCH_RADIUS: 10, // km
  EARTH_RADIUS: 6371 // km
};

// Configuración de tiempo
const TIME_CONFIG = {
  AVERAGE_SPEEDS: {
    CITY: 25, // km/h
    SUBURBAN: 40, // km/h
    HIGHWAY: 55 // km/h
  },
  TRAFFIC_FACTORS: {
    LIGHT: 1.0,
    MODERATE: 1.4,
    HEAVY: 1.8
  }
};

// Límites de la aplicación
const APP_LIMITS = {
  MAX_PAYMENT_AMOUNT: 10000,
  MAX_TRIP_NOTES_LENGTH: 500,
  MAX_CANCELLATION_REASON_LENGTH: 200,
  MAX_SEARCH_RESULTS: 50,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

// Códigos de error personalizados
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  TRIP_ERROR: 'TRIP_ERROR',
  DRIVER_UNAVAILABLE: 'DRIVER_UNAVAILABLE',
  TRIP_ALREADY_ACCEPTED: 'TRIP_ALREADY_ACCEPTED'
};

// Mensajes de respuesta
const RESPONSE_MESSAGES = {
  SUCCESS: {
    USER_REGISTERED: 'Usuario registrado exitosamente',
    LOGIN_SUCCESS: 'Login exitoso',
    LOGOUT_SUCCESS: 'Logout exitoso',
    TRIP_CREATED: 'Solicitud de viaje creada exitosamente',
    TRIP_ACCEPTED: 'Viaje aceptado exitosamente',
    TRIP_STARTED: 'Viaje iniciado exitosamente',
    TRIP_COMPLETED: 'Viaje completado exitosamente',
    TRIP_CANCELLED: 'Viaje cancelado exitosamente',
    PAYMENT_PROCESSED: 'Pago procesado exitosamente',
    VEHICLE_REGISTERED: 'Vehículo registrado exitosamente',
    STATUS_UPDATED: 'Estado actualizado exitosamente',
    LOCATION_UPDATED: 'Ubicación actualizada exitosamente'
  },
  ERROR: {
    USER_EXISTS: 'El usuario ya existe',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    USER_NOT_FOUND: 'Usuario no encontrado',
    TRIP_NOT_FOUND: 'Viaje no encontrado',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado',
    VALIDATION_FAILED: 'Error de validación',
    INTERNAL_ERROR: 'Error interno del servidor',
    DRIVER_NOT_AVAILABLE: 'El conductor no está disponible',
    TRIP_ALREADY_ACCEPTED: 'El viaje ya fue aceptado',
    PAYMENT_FAILED: 'Error al procesar el pago',
    INSUFFICIENT_FUNDS: 'Fondos insuficientes'
  }
};

// Configuración de notificaciones
const NOTIFICATION_TYPES = {
  TRIP_REQUEST: 'trip_request',
  TRIP_ACCEPTED: 'trip_accepted',
  TRIP_STARTED: 'trip_started',
  TRIP_COMPLETED: 'trip_completed',
  TRIP_CANCELLED: 'trip_cancelled',
  PAYMENT_COMPLETED: 'payment_completed',
  DRIVER_ARRIVED: 'driver_arrived'
};

module.exports = {
  TRIP_STATUS,
  TRIP_TYPES,
  USER_ROLES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  VEHICLE_TYPES,
  VEHICLE_FEATURES,
  PRICING_CONFIG,
  DISTANCE_CONFIG,
  TIME_CONFIG,
  APP_LIMITS,
  ERROR_CODES,
  RESPONSE_MESSAGES,
  NOTIFICATION_TYPES
};