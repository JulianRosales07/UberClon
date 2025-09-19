# Configuración del Backend

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
cd Back
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus configuraciones
```

### 3. Configurar MongoDB

#### Opción A: MongoDB Local

1. **Instalar MongoDB Community Server**
   - Descargar desde: https://www.mongodb.com/try/download/community
   - Seguir las instrucciones de instalación para tu sistema operativo

2. **Iniciar MongoDB**
   ```bash
   # Windows (como servicio)
   net start MongoDB
   
   # macOS (con Homebrew)
   brew services start mongodb-community
   
   # Linux (systemd)
   sudo systemctl start mongod
   ```

3. **Verificar conexión**
   ```bash
   # Conectar con MongoDB Shell
   mongosh
   ```

#### Opción B: MongoDB Atlas (Cloud)

1. **Crear cuenta en MongoDB Atlas**
   - Ir a: https://www.mongodb.com/atlas
   - Crear una cuenta gratuita

2. **Crear un cluster**
   - Seguir el wizard de configuración
   - Elegir el tier gratuito (M0)

3. **Configurar acceso**
   - Crear un usuario de base de datos
   - Configurar IP whitelist (0.0.0.0/0 para desarrollo)

4. **Obtener string de conexión**
   - Copiar la URI de conexión
   - Reemplazar `<password>` con tu contraseña

### 4. Configurar .env

```env
# Puerto del servidor
PORT=3000

# MongoDB (Local)
MONGODB_URI=mongodb://localhost:27017/travel_service_db

# MongoDB (Atlas) - Ejemplo
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/travel_service_db

# JWT Secret (cambiar en producción)
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_cambialo_en_produccion

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000

# Entorno
NODE_ENV=development
```

## 🏃‍♂️ Ejecutar la Aplicación

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 🧪 Probar la API

### 1. Verificar que el servidor esté funcionando
```bash
curl http://localhost:3000/api/health
```

### 2. Obtener información de la API
```bash
curl http://localhost:3000/api/info
```

### 3. Registrar un usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "passenger"
  }'
```

### 4. Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

## 📊 Endpoints Disponibles

### Autenticación (`/api/auth`)
- `POST /register` - Registrar usuario
- `POST /login` - Iniciar sesión
- `POST /logout` - Cerrar sesión
- `GET /profile` - Obtener perfil

### Viajes (`/api/trips`)
- `POST /` - Crear solicitud de viaje
- `GET /:id` - Obtener viaje por ID
- `GET /passenger/my-trips` - Mis viajes (pasajero)
- `GET /driver/available` - Viajes disponibles (conductor)
- `PUT /:id/accept` - Aceptar viaje (conductor)
- `PUT /:id/start` - Iniciar viaje (conductor)
- `PUT /:id/complete` - Completar viaje (conductor)
- `PUT /:id/cancel` - Cancelar viaje

### Conductores (`/api/drivers`)
- `PUT /status` - Actualizar disponibilidad
- `PUT /location` - Actualizar ubicación
- `GET /stats` - Obtener estadísticas
- `GET /trips` - Obtener viajes del conductor
- `POST /vehicle` - Registrar vehículo
- `PUT /vehicle/:id` - Actualizar vehículo
- `GET /nearby` - Conductores cercanos

### Pagos (`/api/payments`)
- `POST /` - Procesar pago
- `GET /history` - Historial de pagos
- `GET /earnings` - Ganancias (conductor)
- `POST /:id/refund` - Reembolsar (admin)

## 🔧 Solución de Problemas

### Error: "connect ECONNREFUSED"
- **Problema**: No se puede conectar a MongoDB
- **Solución**: 
  1. Verificar que MongoDB esté ejecutándose
  2. Verificar la URI de conexión en `.env`
  3. Para MongoDB Atlas, verificar credenciales y whitelist de IP

### Error: "ValidationError"
- **Problema**: Datos inválidos en la petición
- **Solución**: Verificar que todos los campos requeridos estén presentes y sean válidos

### Error: "JsonWebTokenError"
- **Problema**: Token JWT inválido o expirado
- **Solución**: 
  1. Verificar que el token esté en el header `Authorization: Bearer <token>`
  2. Hacer login nuevamente para obtener un token válido

### Advertencias de Mongoose
- **Problema**: Índices duplicados
- **Solución**: Ya corregido en los modelos, reiniciar el servidor

## 📝 Notas de Desarrollo

- El servidor se reinicia automáticamente con `nodemon` en modo desarrollo
- Los logs incluyen timestamp y método HTTP para debugging
- La validación de entrada está implementada en todos los endpoints
- Los errores se manejan de forma consistente con códigos HTTP apropiados

## 🔒 Seguridad

- Las contraseñas se hashean con bcrypt (12 rounds)
- Los tokens JWT expiran en 24 horas
- Validación de entrada en todos los endpoints
- CORS configurado para el frontend
- Información sensible no se incluye en las respuestas