# UberClon - Aplicación de Transporte para Pasto, Nariño

Una aplicación completa de transporte tipo Uber desarrollada con React (Frontend) y Node.js (Backend), específicamente configurada para la ciudad de Pasto, Nariño, Colombia.

## 🚀 Características Principales

### 🗺️ **Ubicaciones de Pasto Integradas**
- **Centro de Pasto** - Ubicación de referencia (1.223789, -77.283255)
- **Unicentro** - Centro Comercial (1.216386, -77.288671)
- **Avenida de los Estudiantes** (1.226829, -77.282465)
- **Universidad Mariana** (1.223802, -77.283742)
- **Único** - Centro Comercial (1.205879, -77.260628)
- **Tamasagra** (1.204400, -77.293005)
- **Estadio Libertad** (1.198087, -77.278660)
- **Parque Infantil** (1.218915, -77.281944)
- **Alvernia** (1.220019, -77.298537)

### 🎯 **Funcionalidades Implementadas**
- ✅ Sistema de autenticación (Pasajero/Conductor)
- ✅ Mapa interactivo con marcadores distintivos
- ✅ Destinos rápidos predefinidos
- ✅ Búsqueda de ubicaciones locales
- ✅ Estimación de precios y tiempos
- ✅ Solicitud y seguimiento de viajes
- ✅ Interfaz optimizada para móviles

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **Leaflet** para mapas interactivos
- **Zustand** para manejo de estado
- **Vite** como bundler
- **React Router** para navegación

### Backend
- **Node.js** con Express
- **MongoDB** para base de datos
- **JWT** para autenticación
- **Socket.io** para tiempo real
- **Bcrypt** para encriptación

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o pnpm

### 🚀 Inicio Rápido (Recomendado)

#### Windows CMD:
```cmd
start-dev.bat
```

#### Windows PowerShell:
```powershell
.\start-dev.ps1
```

### 🔧 Instalación Manual

#### Backend
```bash
cd Back
npm install
# El archivo .env ya está configurado
npm run dev
```

#### Frontend
```bash
cd Front/UberClon
npm install
# El archivo .env ya está configurado
npm run dev
```

### 🌐 URLs de Desarrollo
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/info

## 🌟 Últimas Actualizaciones

### ✨ **NUEVA FUNCIONALIDAD: Frontend y Backend Conectados con API de Geolocalización**

#### 🔗 **Integración Completa Frontend-Backend**
- ✅ **API Service configurado** con axios y interceptores
- ✅ **Conexión automática** entre React y Express
- ✅ **Variables de entorno** configuradas (.env)
- ✅ **CORS habilitado** para comunicación cross-origin

#### 🌍 **API de Geolocalización Real**
- ✅ **Nominatim API** integrada (OpenStreetMap)
- ✅ **Búsqueda en tiempo real** de ubicaciones
- ✅ **Geocodificación inversa** (coordenadas → dirección)
- ✅ **Cálculo de distancias** usando fórmula de Haversine
- ✅ **Estimación automática** de tarifas y tiempos

#### 🔍 **Buscador Mejorado**
- ✅ **Autocompletado inteligente** con debounce (300ms)
- ✅ **Resultados de API externa** + fallback local
- ✅ **Indicadores de carga** durante búsquedas
- ✅ **Manejo de errores** con mensajes informativos

#### 🚀 **Scripts de Desarrollo**
- ✅ **start-dev.bat** - Para Windows CMD
- ✅ **start-dev.ps1** - Para PowerShell
- ✅ **Inicio automático** de frontend y backend

### Commit: "feat: Configuración completa para Pasto, Nariño y optimización de UI"

#### 🗺️ **Integración de Ubicaciones de Pasto**
- Reemplazadas todas las coordenadas de Bogotá por ubicaciones reales de Pasto
- Configurados 9 destinos principales con coordenadas exactas
- Implementado sistema de autocompletado con ubicaciones locales

#### 🎨 **Mejoras de Interfaz**
- Optimizado el tamaño de paneles para mejor visualización del mapa
- Reducido padding y espaciado en componentes clave
- Mejorados los marcadores del mapa con iconos distintivos (🟢 origen, 🔴 destino)
- Implementado ajuste automático del zoom para mostrar origen y destino

#### 🔧 **Componentes Actualizados**
- **HomeScreen.tsx**: Destinos rápidos con lugares de Pasto
- **SearchScreen.tsx**: Lista de sugerencias con coordenadas exactas
- **LocationInput.tsx**: Búsqueda con ubicaciones locales
- **GeolocationService.ts**: Autocompletado y estimaciones locales
- **DriverFound.tsx**: UI compacta para mejor visualización del mapa
- **TripRequestWithMap.tsx**: Panel inferior optimizado

#### 🚀 **Funcionalidades Mejoradas**
- Sistema de geolocalización con fallback a ubicación de Pasto
- Cálculo de precios basado en distancias reales
- Estimaciones de tiempo precisas para la ciudad
- Marcadores personalizados en el mapa
- Navegación fluida entre pantallas

## 📱 Flujo de Usuario

1. **Pantalla Principal**
   - Seleccionar "Buscar conductor ahora"
   - Ver destinos rápidos de Pasto

2. **Selección de Destino**
   - Elegir de 9 ubicaciones predefinidas
   - Usar búsqueda con autocompletado

3. **Visualización en Mapa**
   - Ver origen (🟢) y destino (🔴) marcados
   - Mapa ajustado automáticamente

4. **Confirmación de Viaje**
   - Seleccionar tipo de viaje
   - Ver estimación de precio y tiempo
   - Confirmar solicitud

## 🏗️ Estructura del Proyecto

```
UberClon/
├── Back/                          # Backend Node.js
│   ├── src/
│   │   ├── auth/                  # Autenticación
│   │   ├── drivers/               # Gestión de conductores
│   │   ├── locations/             # Servicios de ubicación
│   │   ├── payments/              # Sistema de pagos
│   │   ├── trips/                 # Gestión de viajes
│   │   └── shared/                # Utilidades compartidas
│   └── index.js
├── Front/UberClon/                # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/              # Componentes de autenticación
│   │   │   ├── common/            # Componentes reutilizables
│   │   │   ├── driver/            # Interfaz del conductor
│   │   │   ├── passenger/         # Interfaz del pasajero
│   │   │   └── trip/              # Componentes de viaje
│   │   ├── hooks/                 # Custom hooks
│   │   ├── services/              # Servicios API
│   │   └── store/                 # Estado global
│   └── package.json
└── README.md
```

## 🎯 Próximas Funcionalidades

- [ ] Sistema de pagos integrado
- [ ] Notificaciones push
- [ ] Calificación de conductores
- [ ] Historial de viajes
- [ ] Chat en tiempo real
- [ ] Múltiples tipos de vehículos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo de Desarrollo

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Mapas**: Leaflet + OpenStreetMap
- **Ubicaciones**: Configuradas específicamente para Pasto, Nariño

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto, contacta al equipo de desarrollo.

---

**UberClon Pasto** - Conectando la ciudad de Pasto con tecnología de transporte moderna 🚗✨