# 🚀 Inicio Rápido - UberClon

## ✨ ¡Frontend y Backend ya están conectados!

### 🎯 Para iniciar todo de una vez:

#### Windows:
```cmd
# Opción 1: CMD
start-dev.bat

# Opción 2: PowerShell
.\start-dev.ps1
```

### 🔧 Para iniciar manualmente:

#### Terminal 1 - Backend:
```bash
cd Back
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd Front/UberClon
npm run dev
```

### 🌐 URLs:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/info

### 🧪 Probar conexión:
```bash
node test-connection.js
```

## ✅ Funcionalidades Implementadas:

### 🔗 **Conexión Frontend-Backend**
- ✅ API REST completamente funcional
- ✅ CORS configurado
- ✅ Variables de entorno listas

### 🌍 **API de Geolocalización**
- ✅ Búsqueda de ubicaciones en tiempo real
- ✅ Geocodificación inversa (coordenadas → dirección)
- ✅ Cálculo de distancias y tarifas
- ✅ Integración con Nominatim (OpenStreetMap)

### 🔍 **Buscador Inteligente**
- ✅ Autocompletado con debounce
- ✅ Resultados de API externa + fallback local
- ✅ Indicadores de carga
- ✅ Manejo de errores

### 📱 **Interfaz de Usuario**
- ✅ Búsqueda de rutas funcional
- ✅ Selección de origen y destino
- ✅ Cálculo automático de precios
- ✅ Mapa interactivo con marcadores

## 🎮 Cómo usar:

1. **Inicia la aplicación** con los scripts de arriba
2. **Abre el frontend** en http://localhost:3000
3. **Selecciona "Pasajero"** en la pantalla principal
4. **Busca ubicaciones** en el selector de rutas
5. **Ve los resultados en tiempo real** desde la API
6. **Selecciona origen y destino** para ver el cálculo de tarifa

## 🔧 Endpoints de API disponibles:

- `GET /api/locations-test/search?query=Pasto` - Buscar ubicaciones
- `GET /api/locations-test/details/1.223789/-77.283255` - Geocodificación inversa
- `POST /api/locations-test/distance` - Calcular distancia
- `GET /api/health` - Estado del servidor
- `GET /api/info` - Información de la API

## 🎉 ¡Listo para usar!

Tu aplicación UberClon ahora tiene:
- ✅ Frontend y backend conectados
- ✅ API de geolocalización funcional
- ✅ Búsqueda de rutas en tiempo real
- ✅ Cálculo automático de tarifas
- ✅ Interfaz moderna y responsiva