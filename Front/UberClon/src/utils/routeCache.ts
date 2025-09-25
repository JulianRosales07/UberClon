// Sistema de caché para rutas calculadas
interface RouteCache {
  [key: string]: {
    coordinates: [number, number][];
    timestamp: number;
    duration: number;
    distance: number;
  };
}

const routeCache: RouteCache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

// Generar clave única para la ruta
export const generateRouteKey = (start: { lat: number; lng: number }, end: { lat: number; lng: number }): string => {
  return `${start.lat.toFixed(4)},${start.lng.toFixed(4)}-${end.lat.toFixed(4)},${end.lng.toFixed(4)}`;
};

// Obtener ruta del caché
export const getCachedRoute = (key: string) => {
  const cached = routeCache[key];
  if (!cached) return null;
  
  // Verificar si el caché ha expirado
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    delete routeCache[key];
    return null;
  }
  
  return cached;
};

// Guardar ruta en caché
export const setCachedRoute = (key: string, data: {
  coordinates: [number, number][];
  duration: number;
  distance: number;
}) => {
  routeCache[key] = {
    ...data,
    timestamp: Date.now()
  };
};

// Limpiar caché antiguo
export const cleanOldCache = () => {
  const now = Date.now();
  Object.keys(routeCache).forEach(key => {
    if (now - routeCache[key].timestamp > CACHE_DURATION) {
      delete routeCache[key];
    }
  });
};

// Limpiar caché cada 5 minutos
setInterval(cleanOldCache, 5 * 60 * 1000);