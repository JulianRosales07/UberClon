# Módulo de Conductores

Este módulo maneja toda la funcionalidad específica para conductores y gestión de vehículos.

## 📁 Estructura

```
drivers/
├── controllers/
│   └── DriverController.js  # Controladores de conductores
├── models/
│   └── Vehicle.js          # Modelo de vehículo
├── routes/
│   └── driverRoutes.js     # Rutas de conductores
└── utils/
    └── driverHelpers.js    # Utilidades de conductores
```

## 👨‍✈️ Funcionalidades

### DriverController.js
- `updateDriverStatus` - Actualizar disponibilidad del conductor
- `updateDriverLocation` - Actualizar ubicación del conductor
- `getDriverStats` - Obtener estadísticas del conductor
- `getDriverTrips` - Obtener viajes del conductor
- `registerVehicle` - Registrar vehículo
- `updateVehicle` - Actualizar información del vehículo
- `getNearbyDrivers` - Obtener conductores cercanos

### Vehicle.js (Modelo)
- Esquema de vehículo con información completa
- Tipos de vehículo (sedan, suv, hatchback, etc.)
- Documentos del vehículo (registro, seguro, inspección)
- Características especiales (aire acondicionado, GPS, etc.)

### driverHelpers.js (Utilidades)
- `calculateDriverRating` - Calcular rating promedio
- `isDriverAvailable` - Verificar disponibilidad
- `calculateDriverEarnings` - Calcular ganancias
- `findNearbyDrivers` - Buscar conductores cercanos
- `validateVehicleData` - Validar datos del vehículo
- `canAcceptTrip` - Verificar si puede aceptar viaje

## 🛣️ Rutas

| Método | Ruta | Descripción | Autenticación | Rol |
|--------|------|-------------|---------------|-----|
| PUT | `/api/drivers/status` | Actualizar estado | Sí | Driver |
| PUT | `/api/drivers/location` | Actualizar ubicación | Sí | Driver |
| GET | `/api/drivers/stats` | Obtener estadísticas | Sí | Driver |
| GET | `/api/drivers/trips` | Obtener viajes | Sí | Driver |
| POST | `/api/drivers/vehicle` | Registrar vehículo | Sí | Driver |
| PUT | `/api/drivers/vehicle/:id` | Actualizar vehículo | Sí | Driver |
| GET | `/api/drivers/nearby` | Conductores cercanos | Sí | Cualquiera |

## 🔧 Uso

```javascript
// Actualizar estado del conductor
PUT /api/drivers/status
{
  "isAvailable": true
}

// Actualizar ubicación
PUT /api/drivers/location
{
  "lat": 40.7128,
  "lng": -74.0060
}

// Registrar vehículo
POST /api/drivers/vehicle
{
  "make": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "color": "Blanco",
  "licensePlate": "ABC123",
  "vehicleType": "sedan"
}

// Buscar conductores cercanos
GET /api/drivers/nearby?lat=40.7128&lng=-74.0060&radius=5
```

## 🚗 Tipos de Vehículo

- **sedan** - Sedán
- **suv** - SUV
- **hatchback** - Hatchback
- **pickup** - Pickup
- **van** - Van
- **motorcycle** - Motocicleta

## ⭐ Características del Vehículo

- **air_conditioning** - Aire acondicionado
- **bluetooth** - Bluetooth
- **gps** - GPS
- **child_seat** - Asiento para niños
- **wheelchair_accessible** - Accesible para sillas de ruedas
- **pet_friendly** - Acepta mascotas

## 📊 Estadísticas del Conductor

- Total de viajes completados
- Ganancias totales y netas
- Rating promedio
- Tiempo de respuesta promedio
- Tasa de finalización de viajes