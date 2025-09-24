# Funcionalidad: Notificaciones de Servicios en Tiempo Real para Conductores

## Descripción
Esta funcionalidad permite que cuando un pasajero solicita un servicio, los conductores disponibles reciban la notificación en tiempo real y puedan aceptar o rechazar la solicitud.

## Arquitectura de la Solución

### 1. Tecnologías Requeridas
- **WebSockets** (Socket.IO) para comunicación en tiempo real
- **Base de datos** para gestionar estados de viajes y conductores
- **Sistema de geolocalización** para encontrar conductores cercanos

### 2. Componentes Principales

#### Backend (Node.js + Socket.IO)
- Servidor WebSocket para manejar conexiones en tiempo real
- API endpoints para gestión de viajes
- Sistema de matching entre pasajeros y conductores
- Gestión de estados de conductores (disponible/ocupado)

#### Frontend - Conductor
- Componente de notificaciones en tiempo real
- Modal/Panel para aceptar/rechazar servicios
- Actualización automática del estado del conductor

#### Frontend - Pasajero
- Indicador de búsqueda de conductor
- Notificación cuando un conductor acepta el viaje

## Implementación Paso a Paso

### Fase 1: Configuración del Backend

#### 1.1 Instalar Dependencias
```bash
cd Back
npm install socket.io
```

#### 1.2 Configurar Socket.IO en el servidor
```javascript
// En Back/index.js o archivo principal
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
```

#### 1.3 Crear endpoints para gestión de viajes
- `POST /api/rides/request` - Solicitar viaje
- `POST /api/rides/:id/accept` - Aceptar viaje
- `POST /api/rides/:id/reject` - Rechazar viaje
- `GET /api/drivers/nearby` - Obtener conductores cercanos

### Fase 2: Lógica de Matching y Notificaciones

#### 2.1 Sistema de Rooms por Geolocalización
```javascript
// Agrupar conductores por zonas geográficas
io.on('connection', (socket) => {
  socket.on('driver-online', (driverData) => {
    const zone = calculateZone(driverData.lat, driverData.lng);
    socket.join(`zone-${zone}`);
  });
});
```

#### 2.2 Envío de Notificaciones
```javascript
// Cuando un pasajero solicita viaje
socket.on('request-ride', (rideData) => {
  const nearbyDrivers = findNearbyDrivers(rideData.pickup);
  nearbyDrivers.forEach(driver => {
    io.to(driver.socketId).emit('new-ride-request', {
      rideId: rideData.id,
      passenger: rideData.passenger,
      pickup: rideData.pickup,
      destination: rideData.destination,
      estimatedFare: rideData.fare
    });
  });
});
```

### Fase 3: Frontend - Componente del Conductor

#### 3.1 Configurar Socket.IO en React
```bash
cd Front/UberClon
npm install socket.io-client
```

#### 3.2 Crear Hook para Notificaciones
```typescript
// src/hooks/useRideNotifications.ts
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useRideNotifications = (driverId: string) => {
  const [socket, setSocket] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('driver-online', { driverId });

    newSocket.on('new-ride-request', (request) => {
      setRideRequest(request);
    });

    return () => newSocket.close();
  }, [driverId]);

  return { socket, rideRequest, setRideRequest };
};
```

#### 3.3 Componente de Notificación de Viaje
```typescript
// src/components/driver/RideRequestModal.tsx
interface RideRequestModalProps {
  request: RideRequest;
  onAccept: () => void;
  onReject: () => void;
}

export const RideRequestModal: React.FC<RideRequestModalProps> = ({
  request,
  onAccept,
  onReject
}) => {
  const [timeLeft, setTimeLeft] = useState(30); // 30 segundos para responder

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onReject(); // Auto-rechazar si no responde
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReject]);

  return (
    <div className="ride-request-modal">
      <h3>Nueva Solicitud de Viaje</h3>
      <p>Pasajero: {request.passenger.name}</p>
      <p>Origen: {request.pickup.address}</p>
      <p>Destino: {request.destination.address}</p>
      <p>Tarifa estimada: ${request.estimatedFare}</p>
      <p>Tiempo restante: {timeLeft}s</p>
      
      <div className="actions">
        <button onClick={onAccept} className="accept-btn">
          Aceptar
        </button>
        <button onClick={onReject} className="reject-btn">
          Rechazar
        </button>
      </div>
    </div>
  );
};
```

### Fase 4: Integración en DriverMap

#### 4.1 Actualizar DriverMap.tsx
```typescript
// Agregar al componente DriverMap
const { socket, rideRequest, setRideRequest } = useRideNotifications(driverId);

const handleAcceptRide = () => {
  socket?.emit('accept-ride', { rideId: rideRequest.rideId, driverId });
  setRideRequest(null);
};

const handleRejectRide = () => {
  socket?.emit('reject-ride', { rideId: rideRequest.rideId, driverId });
  setRideRequest(null);
};

// En el JSX
{rideRequest && (
  <RideRequestModal
    request={rideRequest}
    onAccept={handleAcceptRide}
    onReject={handleRejectRide}
  />
)}
```

### Fase 5: Frontend - Actualización del Pasajero

#### 5.1 Indicador de Búsqueda
```typescript
// En PassengerHome o SearchScreen
const [searchingDriver, setSearchingDriver] = useState(false);
const [driverFound, setDriverFound] = useState(null);

useEffect(() => {
  if (socket) {
    socket.on('driver-accepted', (driverData) => {
      setSearchingDriver(false);
      setDriverFound(driverData);
    });

    socket.on('no-drivers-available', () => {
      setSearchingDriver(false);
      // Mostrar mensaje de no hay conductores disponibles
    });
  }
}, [socket]);
```

## Estructura de Archivos Nuevos

```
Back/
├── src/
│   ├── controllers/
│   │   └── rideController.js
│   ├── services/
│   │   ├── socketService.js
│   │   └── matchingService.js
│   └── models/
│       └── Ride.js

Front/UberClon/src/
├── hooks/
│   └── useRideNotifications.ts
├── components/
│   ├── driver/
│   │   └── RideRequestModal.tsx
│   └── passenger/
│       └── DriverSearchIndicator.tsx
└── services/
    └── socketService.ts
```

## Estados del Viaje

1. **REQUESTED** - Pasajero solicita viaje
2. **SEARCHING** - Buscando conductores disponibles
3. **PENDING** - Enviado a conductores, esperando respuesta
4. **ACCEPTED** - Conductor acepta el viaje
5. **IN_PROGRESS** - Viaje en curso
6. **COMPLETED** - Viaje completado
7. **CANCELLED** - Viaje cancelado

## Consideraciones Técnicas

### Timeouts y Reintentos
- Timeout de 30 segundos para respuesta del conductor
- Si no hay respuesta, enviar a siguiente conductor más cercano
- Máximo 3 intentos antes de mostrar "No hay conductores disponibles"

### Gestión de Conexiones
- Reconexión automática en caso de pérdida de conexión
- Heartbeat para verificar conexiones activas
- Cleanup de sockets desconectados

### Optimizaciones
- Usar Redis para gestión de sesiones en producción
- Implementar rate limiting para evitar spam
- Caché de ubicaciones de conductores

## Testing

### Pruebas Unitarias
- Lógica de matching de conductores
- Gestión de estados de viajes
- Timeouts y reintentos

### Pruebas de Integración
- Flujo completo pasajero-conductor
- Múltiples solicitudes simultáneas
- Reconexión de WebSockets

## Próximos Pasos

1. Implementar la configuración básica del WebSocket
2. Crear los endpoints de la API
3. Desarrollar el componente de notificaciones
4. Integrar con el mapa del conductor
5. Agregar indicadores visuales para el pasajero
6. Implementar sistema de timeouts
7. Agregar pruebas automatizadas

## Archivos a Modificar

- `Back/index.js` - Configuración de Socket.IO
- `Back/src/routes/rides.js` - Nuevos endpoints
- `Front/UberClon/src/components/driver/DriverMap.tsx` - Integración de notificaciones
- `Front/UberClon/src/components/passenger/PassengerHome.tsx` - Indicadores de búsqueda
- `Front/UberClon/src/services/rideService.ts` - Métodos de WebSocket

Esta implementación proporcionará una experiencia fluida y en tiempo real para la comunicación entre pasajeros y conductores.