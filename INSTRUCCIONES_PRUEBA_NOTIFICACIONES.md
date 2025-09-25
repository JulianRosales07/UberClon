# 🚕 Instrucciones para Probar las Notificaciones en Tiempo Real

## Configuración Inicial

### 1. Iniciar el Backend
```bash
cd Back
npm start
```
El backend debe estar corriendo en `http://localhost:3001`

### 2. Iniciar el Frontend
```bash
cd Front/UberClon
npm run dev
```
El frontend debe estar corriendo en `http://localhost:3000`

## Cómo Probar el Sistema

### Opción 1: Usando dos ventanas del navegador

#### Ventana 1 - Conductor de Prueba
1. Ve a: `http://localhost:3000/?driver-test=true`
2. Haz clic en "🟢 Conectarse" para poner al conductor en línea
3. Verifica que aparezca "Conectado" y "En línea y disponible"
4. Deja esta ventana abierta

#### Ventana 2 - Pasajero
1. Ve a: `http://localhost:3000`
2. Haz clic en "Buscar conductor ahora" o "Continuar"
3. Selecciona origen y destino
4. Elige un tipo de viaje (UberX, Comfort, etc.)
5. Haz clic en "Confirmar UberX"

### Opción 2: Usando el botón de prueba en la página principal

1. Ve a: `http://localhost:3000`
2. Haz clic en el botón "🧪 Test" en la esquina superior derecha
3. Esto abrirá la página de conductor de prueba
4. Sigue los pasos de la Opción 1

## Qué Esperar

### En la Ventana del Conductor:
1. **Sonido**: Escucharás un sonido de notificación
2. **Vibración**: El dispositivo vibrará (si es móvil)
3. **Modal**: Aparecerá un modal grande con la información del viaje:
   - Información del pasajero
   - Origen y destino
   - Tarifa estimada
   - Contador de 30 segundos
4. **Notificación del navegador**: Si diste permisos, verás una notificación

### En la Ventana del Pasajero:
1. **Indicador de búsqueda**: Aparecerá un modal animado
2. **Mensaje**: "Buscando conductores cercanos..."
3. **Contador**: Tiempo de búsqueda
4. **Resultado**: Cuando el conductor acepte, verás la información del conductor

## Acciones del Conductor

### Aceptar Viaje:
- Haz clic en "✅ Aceptar Viaje"
- El pasajero verá inmediatamente la información del conductor
- El viaje cambiará a estado "aceptado"

### Rechazar Viaje:
- Haz clic en "❌ Rechazar"
- El sistema buscará el siguiente conductor disponible
- Si no hay más conductores, el pasajero verá "No hay conductores disponibles"

### Timeout (30 segundos):
- Si no respondes en 30 segundos, el viaje se rechaza automáticamente
- Se envía al siguiente conductor disponible

## Múltiples Conductores

Para probar con múltiples conductores:

1. Abre varias pestañas con `http://localhost:3000/?driver-test=true`
2. Conecta todos los conductores
3. Cuando un pasajero solicite un viaje, solo el conductor más cercano recibirá la notificación
4. Si rechaza o no responde, se enviará al siguiente

## Debugging

### Consola del Navegador:
- Abre las herramientas de desarrollador (F12)
- Ve a la pestaña "Console"
- Verás logs detallados de:
  - Conexiones WebSocket
  - Solicitudes de viaje
  - Respuestas de conductores
  - Estados de conexión

### Logs del Backend:
En la terminal donde corre el backend verás:
- Conexiones de conductores y pasajeros
- Solicitudes de viaje
- Aceptaciones y rechazos
- Estadísticas cada minuto

## Solución de Problemas

### "No hay conductores disponibles"
- Asegúrate de que al menos un conductor esté conectado y en línea
- Verifica que el backend esté corriendo
- Revisa la consola para errores de WebSocket

### No aparece el modal de notificación
- Verifica que el conductor esté "Conectado" (indicador verde)
- Asegúrate de que esté en estado "En línea y disponible"
- Revisa la consola para errores

### No se reproduce el sonido
- Algunos navegadores bloquean audio automático
- Haz clic en la página primero para habilitar audio
- Verifica que el volumen esté activado

### No vibra en móvil
- La vibración solo funciona en dispositivos móviles
- Algunos navegadores requieren HTTPS para vibración
- Prueba en Chrome móvil

## Características Implementadas

✅ **WebSocket en tiempo real**
✅ **Notificaciones visuales con modal**
✅ **Sonido de notificación**
✅ **Vibración en móviles**
✅ **Notificaciones del navegador**
✅ **Sistema de timeout (30 segundos)**
✅ **Búsqueda de conductores cercanos**
✅ **Reintentos automáticos**
✅ **Estados de conexión en tiempo real**
✅ **Interfaz responsive**
✅ **Múltiples conductores**
✅ **Historial de viajes aceptados**

## Próximas Mejoras

🔄 **Geolocalización real de conductores**
🔄 **Cálculo de rutas optimizadas**
🔄 **Chat en tiempo real**
🔄 **Seguimiento del viaje en progreso**
🔄 **Sistema de calificaciones**
🔄 **Pagos integrados**

---

¡El sistema de notificaciones en tiempo real está completamente funcional! 🎉