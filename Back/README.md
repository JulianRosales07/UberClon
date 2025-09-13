# Backend API - Sistema de Solicitud de Carreras/Servicios de Viajes

Este es el backend para un sistema de solicitud de carreras y servicios de viajes, construido con Node.js, Express y MongoDB.

## 🚀 Tecnologías

- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **CORS** - Middleware para habilitar CORS
- **Axios** - Cliente HTTP para realizar peticiones
- **dotenv** - Manejo de variables de entorno

## 📁 Estructura del Proyecto

```
Back/
├── Controllers/     # Controladores de la aplicación
├── models/         # Modelos de datos (Mongoose schemas)
├── routes/         # Definición de rutas de la API
├── utils/          # Funciones utilitarias y helpers
├── .env           # Variables de entorno (no incluido en git)
├── index.js       # Punto de entrada de la aplicación
└── package.json   # Dependencias y scripts del proyecto
```

## ⚙️ Instalación

1. Navega al directorio del backend:

```bash
cd Back
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` con las siguientes variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tu_base_de_datos
NODE_ENV=development
```

## 🏃‍♂️ Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

## 📂 Archivos a Crear en Cada Carpeta

### Controllers/

**Archivos necesarios:**

- `AuthController.js` - Manejo de autenticación (login, registro, logout)
- `UserController.js` - Gestión de usuarios (pasajeros y conductores)
- `TripController.js` - Gestión de solicitudes de viajes/carreras
- `DriverController.js` - Operaciones específicas de conductores
- `BookingController.js` - Manejo de reservas y solicitudes

**Ejemplo de estructura:**

```javascript
// Controllers/TripController.js
const Trip = require("../models/Trip");
const { sendSuccess, sendError } = require("../utils/responseHelper");

const createTripRequest = async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      passengerId: req.user.id,
      status: "pending",
    };
    const newTrip = new Trip(tripData);
    const savedTrip = await newTrip.save();
    sendSuccess(res, savedTrip, "Solicitud de viaje creada exitosamente");
  } catch (error) {
    sendError(res, error, 400);
  }
};

const getTripsByPassenger = async (req, res) => {
  try {
    const trips = await Trip.find({ passengerId: req.user.id })
      .populate("driverId", "name phone vehicle")
      .sort({ createdAt: -1 });
    sendSuccess(res, trips, "Viajes obtenidos exitosamente");
  } catch (error) {
    sendError(res, error);
  }
};

const acceptTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        driverId: req.user.id,
        status: "accepted",
        acceptedAt: new Date(),
      },
      { new: true }
    );
    if (!trip) {
      return sendError(res, "Viaje no encontrado", 404);
    }
    sendSuccess(res, trip, "Viaje aceptado exitosamente");
  } catch (error) {
    sendError(res, error);
  }
};

const completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        status: "completed",
        completedAt: new Date(),
        finalPrice: req.body.finalPrice,
      },
      { new: true }
    );
    sendSuccess(res, trip, "Viaje completado exitosamente");
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = {
  createTripRequest,
  getTripsByPassenger,
  acceptTrip,
  completeTrip,
};
```

### models/

**Archivos necesarios:**

- `User.js` - Modelo de usuario (pasajeros y conductores)
- `Trip.js` - Modelo de viajes/carreras
- `Vehicle.js` - Modelo de vehículos
- `Rating.js` - Modelo de calificaciones
- `Payment.js` - Modelo de pagos

**Ejemplo de estructura:**

```javascript
// models/Trip.js
const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    origin: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    destination: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    estimatedPrice: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    tripType: {
      type: String,
      enum: ["standard", "premium", "shared"],
      default: "standard",
    },
    scheduledTime: {
      type: Date,
      default: null,
    },
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);
```

```javascript
// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email inválido"],
    },
    phone: {
      type: String,
      required: [true, "El teléfono es requerido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["passenger", "driver", "admin"],
      default: "passenger",
    },
    profileImage: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    // Campos específicos para conductores
    driverInfo: {
      licenseNumber: String,
      vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
      },
      isAvailable: {
        type: Boolean,
        default: false,
      },
      rating: {
        type: Number,
        default: 5.0,
        min: 1,
        max: 5,
      },
      totalTrips: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
```

### routes/

**Archivos necesarios:**

- `index.js` - Archivo principal que agrupa todas las rutas
- `authRoutes.js` - Rutas de autenticación
- `userRoutes.js` - Rutas de usuarios
- `tripRoutes.js` - Rutas de viajes/carreras
- `driverRoutes.js` - Rutas específicas de conductores
- `paymentRoutes.js` - Rutas de pagos

**Ejemplo de estructura:**

```javascript
// routes/index.js
const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const tripRoutes = require("./tripRoutes");
const driverRoutes = require("./driverRoutes");
const paymentRoutes = require("./paymentRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/trips", tripRoutes);
router.use("/drivers", driverRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;
```

```javascript
// routes/tripRoutes.js
const express = require("express");
const {
  createTripRequest,
  getTripsByPassenger,
  acceptTrip,
  completeTrip,
  cancelTrip,
  getAvailableTrips,
} = require("../Controllers/TripController");
const { validateTrip } = require("../utils/validators");
const { authenticateToken, requireRole } = require("../utils/auth");

const router = express.Router();

// Rutas para pasajeros
router.post("/", authenticateToken, validateTrip, createTripRequest);
router.get("/my-trips", authenticateToken, getTripsByPassenger);
router.put("/:id/cancel", authenticateToken, cancelTrip);

// Rutas para conductores
router.get(
  "/available",
  authenticateToken,
  requireRole("driver"),
  getAvailableTrips
);
router.put("/:id/accept", authenticateToken, requireRole("driver"), acceptTrip);
router.put(
  "/:id/complete",
  authenticateToken,
  requireRole("driver"),
  completeTrip
);

module.exports = router;
```

### utils/

**Archivos necesarios:**

- `responseHelper.js` - Funciones para estandarizar respuestas
- `validators.js` - Validadores de datos específicos del sistema
- `auth.js` - Funciones de autenticación y autorización
- `database.js` - Configuración de conexión a la base de datos
- `priceCalculator.js` - Cálculo de precios de viajes
- `distanceCalculator.js` - Cálculo de distancias y rutas
- `constants.js` - Constantes de la aplicación

**Ejemplo de estructura:**

```javascript
// utils/responseHelper.js
const sendSuccess = (
  res,
  data,
  message = "Operación exitosa",
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, error, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    error: error.message || error,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { sendSuccess, sendError };
```

```javascript
// utils/validators.js
const validateTrip = (req, res, next) => {
  const { origin, destination, tripType } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({
      success: false,
      error: "Origen y destino son requeridos",
    });
  }

  if (
    !origin.address ||
    !origin.coordinates ||
    !destination.address ||
    !destination.coordinates
  ) {
    return res.status(400).json({
      success: false,
      error: "Direcciones y coordenadas completas son requeridas",
    });
  }

  const validTripTypes = ["standard", "premium", "shared"];
  if (tripType && !validTripTypes.includes(tripType)) {
    return res.status(400).json({
      success: false,
      error: "Tipo de viaje inválido",
    });
  }

  next();
};

const validateUser = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      success: false,
      error: "Nombre, email, contraseña y teléfono son requeridos",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  next();
};

module.exports = { validateTrip, validateUser };
```

```javascript
// utils/priceCalculator.js
const calculateTripPrice = (
  distance,
  tripType = "standard",
  timeOfDay = "normal"
) => {
  const basePrices = {
    standard: 2.5,
    premium: 4.0,
    shared: 1.8,
  };

  const timeMultipliers = {
    normal: 1.0,
    peak: 1.5,
    night: 1.2,
  };

  const basePrice = basePrices[tripType] || basePrices.standard;
  const timeMultiplier = timeMultipliers[timeOfDay] || timeMultipliers.normal;
  const minimumFare = 5.0;

  const calculatedPrice = distance * basePrice * timeMultiplier;

  return Math.max(calculatedPrice, minimumFare);
};

const getPeakTimeMultiplier = () => {
  const hour = new Date().getHours();

  // Horas pico: 7-9 AM y 5-7 PM
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    return "peak";
  }

  // Horario nocturno: 10 PM - 6 AM
  if (hour >= 22 || hour <= 6) {
    return "night";
  }

  return "normal";
};

module.exports = { calculateTripPrice, getPeakTimeMultiplier };
```

```javascript
// utils/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

## 🔧 Scripts Disponibles

- `npm start` - Inicia la aplicación en modo producción
- `npm run dev` - Inicia la aplicación en modo desarrollo con nodemon
- `npm test` - Ejecuta las pruebas (por configurar)

## 🌐 Variables de Entorno

Crea un archivo `.env` en la raíz del directorio Back con las siguientes variables:

```env
# Puerto del servidor
PORT=3000

# URL de conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017/travel_service_db

# Entorno de ejecución
NODE_ENV=development

# JWT para autenticación
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# API Keys para servicios externos
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key

# Configuración de notificaciones
TWILIO_ACCOUNT_SID=tu_twilio_account_sid
TWILIO_AUTH_TOKEN=tu_twilio_auth_token
TWILIO_PHONE_NUMBER=tu_numero_twilio

# Email service
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
```

## 📝 Convenciones de Código

- Usar camelCase para variables y funciones
- Usar PascalCase para nombres de modelos y clases
- Usar kebab-case para nombres de archivos de rutas
- Incluir manejo de errores en todos los controladores
- Usar async/await para operaciones asíncronas
- Validar datos de entrada en los controladores

## 🚦 Estados HTTP

La API utiliza los siguientes códigos de estado HTTP:

- `200` - OK: Petición exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Error en los datos enviados
- `401` - Unauthorized: No autorizado
- `404` - Not Found: Recurso no encontrado
- `500` - Internal Server Error: Error interno del servidor

## 🔒 Seguridad

- Usar CORS para controlar el acceso desde diferentes dominios
- Validar y sanitizar todas las entradas de usuario
- Implementar autenticación y autorización según sea necesario
- No exponer información sensible en las respuestas de error

## 📚 Recursos Adicionales

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Node.js Documentation](https://nodejs.org/docs/)

## 🤝 Contribución

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios y commitea: `git commit -m 'Agrega nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia ISC.
