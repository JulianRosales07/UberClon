# Módulo de Viajes

Este módulo maneja toda la funcionalidad relacionada con la gestión de viajes y solicitudes de carreras.

## 📁 Estructura

```
trips/
├── controllers/
│   └── TripController.js    # Controladores de viajes
├── models/
│   └── Trip.js             # Modelo de viaje
├── routes/
│   └── tripRoutes.js       # Rutas de viajes
└── utils/
    └── tripHelpers.js      # Utilidades de viajes
```

## 🚗 Funcionalidades

### TripController.js
- `createTripRequest` - Crear solicitud de viaje
- `getTripsByPassenger` - Obtener viajes del pasajero
- `getAvailableTrips` - Obtener viajes disponibles para conductores
- `acceptTrip` - Aceptar un viaje (conductor)
- `startTrip` - Iniciar un viaje
- `completeTrip` - Completar un viaje
- `cancelTrip` - Cancelar un viaje
- `getTripById` - Obtener detalles de un viaje

### Trip.js (Modelo)
- Esquema de viaje con origen y destino
- Estados del viaje (pending, accepted, in_progress, completed, cancelled)
- Tipos de viaje (standard, premium, shared)
- Precios estimados y finales
- Índices geoespaciales para búsquedas por ubicación

### tripHelpers.js (Utilidades)
- `validateTripCoordinates` - Validar coordenadas del viaje
- `calculateTripEstimates` - Calcular estimaciones de precio y tiempo
- `generateTripCode` - Generar código único del viaje
- `canCancelTrip` - Verificar si se puede cancelar un viaje
- `isValidStatusTransition` - Validar transiciones de estado
- `formatTripForResponse` - Formatear viaje para respuesta

## 🛣️ Rutas

| Método | Ruta | Descripción | Autenticación | Rol |
|--------|------|-------------|---------------|-----|
| POST | `/api/trips/` | Crear viaje | Sí | Cualquiera |
| GET | `/api/trips/:id` | Obtener viaje | Sí | Propietario |
| PUT | `/api/trips/:id/cancel` | Cancelar viaje | Sí | Propietario |
| GET | `/api/trips/passenger/my-trips` | Mis viajes | Sí | Passenger |
| GET | `/api/trips/driver/available` | Viajes disponibles | Sí | Driver |
| PUT | `/api/trips/:id/accept` | Aceptar viaje | Sí | Driver |
| PUT | `/api/trips/:id/start` | Iniciar viaje | Sí | Driver |
| PUT | `/api/trips/:id/complete` | Completar viaje | Sí | Driver |

## 🔧 Uso

```javascript
// Crear solicitud de viaje
POST /api/trips/
{
  "origin": {
    "address": "Calle 123, Ciudad",
    "coordinates": { "lat": 40.7128, "lng": -74.0060 }
  },
  "destination": {
    "address": "Avenida 456, Ciudad",
    "coordinates": { "lat": 40.7589, "lng": -73.9851 }
  },
  "tripType": "standard",
  "notes": "Edificio azul"
}

// Aceptar viaje (conductor)
PUT /api/trips/60d5ec49f1b2c8b1f8e4e1a1/accept
```

## 📊 Estados del Viaje

1. **pending** - Esperando conductor
2. **accepted** - Conductor asignado
3. **in_progress** - Viaje en curso
4. **completed** - Viaje completado
5. **cancelled** - Viaje cancelado

## 🎯 Tipos de Viaje

- **standard** - Viaje estándar
- **premium** - Viaje premium (vehículo de lujo)
- **shared** - Viaje compartido (menor costo)