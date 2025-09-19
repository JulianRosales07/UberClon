# 🌍 Guía de Configuración de Geolocalización

## 📦 Dependencias Requeridas

### 1. Instalar dependencias de mapas
```bash
npm install react-leaflet leaflet
npm install @types/leaflet  # Si usas TypeScript
```

### 2. Agregar estilos CSS de Leaflet
En tu `public/index.html`, agrega:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" 
      integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" 
      crossorigin=""/>
```

### 3. Configurar proxy para desarrollo
En tu `package.json`, agrega:
```json
{
  "name": "uber-clone-frontend",
  "proxy": "http://localhost:3000",
  "dependencies": {
    // ... tus dependencias existentes
  }
}
```

## 🔧 Configuración del Backend

### 1. Asegúrate de que el servidor backend esté ejecutándose
```bash
cd Back
npm run dev
```

### 2. Verifica que las rutas de geolocalización estén disponibles
- `POST /api/geolocation/current-location`
- `GET /api/geolocation/search`
- `GET /api/geolocation/autocomplete`
- `GET /api/trips/nearby-drivers`
- `POST /api/trips`

## 🚀 Implementación Paso a Paso

### Paso 1: Configurar el servicio de geolocalización
El archivo `src/services/GeolocationService.ts` ya está creado y configurado.

### Paso 2: Configurar el hook de geolocalización
El archivo `src/hooks/useGeolocation.ts` ya está creado.

### Paso 3: Actualizar tu App.tsx principal
Reemplaza tu `src/App.tsx` con el archivo que creamos.

### Paso 4: Usar los componentes
```tsx
import UberApp from './components/app/UberApp';

function App() {
  return <UberApp />;
}
```

## 🗺️ Uso de los Componentes

### DriverMap - Mapa principal
```tsx
import { DriverMap } from './components/driver/DriverMap';

<DriverMap
  center={{ lat: 40.7580, lng: -73.9855 }}
  zoom={15}
  authToken={userToken}
  onLocationUpdate={(location) => console.log(location)}
/>
```

### TripRequestWithMap - Solicitud de viajes
```tsx
import TripRequestWithMap from './components/trip/TripRequestWithMap';

<TripRequestWithMap
  onTripRequest={(tripData) => console.log(tripData)}
  authToken={userToken}
/>
```

### useGeolocation Hook
```tsx
import { useGeolocation } from './hooks/useGeolocation';

const { location, getCurrentLocation, startWatching } = useGeolocation({
  autoStart: true,
  watch: true
});
```

## 🔐 Configuración de Autenticación

### Mock de usuario para pruebas
```tsx
const mockUser = {
  id: '123',
  name: 'Usuario de Prueba',
  email: 'test@example.com',
  role: 'passenger', // o 'driver'
  token: 'mock_jwt_token'
};
```

### Integración con tu sistema de auth existente
```tsx
// En tu componente principal
const [user, setUser] = useState(null);

// Obtener usuario del localStorage o tu API
useEffect(() => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    setUser(JSON.parse(savedUser));
  }
}, []);
```

## 📱 Permisos de Ubicación

### Manejar permisos en el navegador
```tsx
// El hook useGeolocation maneja automáticamente:
// - Solicitud de permisos
// - Manejo de errores
// - Reintentos automáticos
// - Mensajes de error descriptivos
```

### Mensajes de error comunes
- `PERMISSION_DENIED`: Usuario denegó permisos
- `POSITION_UNAVAILABLE`: GPS no disponible
- `TIMEOUT`: Tiempo de espera agotado

## 🧪 Pruebas y Debugging

### 1. Probar ubicación actual
```bash
# Abrir en navegador
open Back/src/geolocation/test/test-location.html
```

### 2. Probar API desde consola
```bash
cd Back
node src/geolocation/test/test-location-api.js
```

### 3. Probar con cURL
```bash
curl -X POST http://localhost:3000/api/geolocation/current-location \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.7580, "lng": -73.9855, "accuracy": 10}'
```

## 🔧 Configuración Avanzada

### Variables de entorno
Crea un archivo `.env` en tu frontend:
```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_MAPS_DEFAULT_ZOOM=15
REACT_APP_GEOLOCATION_TIMEOUT=10000
```

### Configuración del servicio
```tsx
// En GeolocationService.ts
const geolocationService = new GeolocationService(
  process.env.REACT_APP_API_BASE_URL || '/api/geolocation'
);
```

## 📊 Monitoreo y Analytics

### Eventos de ubicación
```tsx
const { location } = useGeolocation({
  onLocationUpdate: (location) => {
    // Enviar evento a analytics
    analytics.track('location_updated', {
      accuracy: location.accuracy,
      timestamp: location.timestamp
    });
  },
  onLocationError: (error) => {
    // Reportar error
    analytics.track('location_error', {
      error_code: error.code,
      error_message: error.message
    });
  }
});
```

## 🚨 Solución de Problemas

### Error: "Module not found: Can't resolve 'leaflet'"
```bash
npm install leaflet react-leaflet @types/leaflet
```

### Error: "Default markers not showing"
Ya está solucionado en el código con:
```tsx
// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
```

### Error: "Geolocation not working"
1. Verifica que estés usando HTTPS o localhost
2. Verifica permisos del navegador
3. Verifica que el GPS esté habilitado

### Error: "API calls failing"
1. Verifica que el backend esté ejecutándose
2. Verifica la configuración del proxy
3. Verifica las rutas de la API

## 📱 Optimización para Móviles

### Configuración responsive
```css
/* Ya incluido en los componentes */
@media (max-width: 768px) {
  .location-controls {
    flex-direction: column;
  }
}
```

### Configuración de geolocalización para móviles
```tsx
const mobileOptions = {
  enableHighAccuracy: true,
  timeout: 15000, // Más tiempo en móviles
  maximumAge: 30000 // Cache más corto
};
```

## 🎯 Próximos Pasos

1. **Implementar autenticación real** con JWT
2. **Agregar notificaciones push** para conductores
3. **Implementar WebSockets** para actualizaciones en tiempo real
4. **Agregar modo offline** con caché local
5. **Implementar analytics** de uso

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs del navegador (F12)
2. Verifica que el backend esté funcionando
3. Prueba con las herramientas de debugging incluidas
4. Verifica los permisos de ubicación del navegador