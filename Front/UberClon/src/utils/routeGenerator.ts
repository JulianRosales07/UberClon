// Generador de rutas que simula calles sin depender de servicios externos

interface Point {
  lat: number;
  lng: number;
}

// Función para calcular distancia entre dos puntos
function calculateDistance(p1: Point, p2: Point): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Generar puntos intermedios que simulan seguir calles
export function generateStreetRoute(start: Point, end: Point): [number, number][] {
  const route: [number, number][] = [];
  
  // Agregar punto de inicio
  route.push([start.lat, start.lng]);
  
  // Calcular la distancia total
  const totalDistance = calculateDistance(start, end);
  
  // Determinar número de puntos basado en la distancia
  const pointsPerKm = 15; // Más puntos = ruta más suave
  const numPoints = Math.max(10, Math.floor(totalDistance * pointsPerKm));
  
  // Generar puntos intermedios con variaciones para simular calles
  for (let i = 1; i < numPoints; i++) {
    const progress = i / numPoints;
    
    // Interpolación básica
    let lat = start.lat + (end.lat - start.lat) * progress;
    let lng = start.lng + (end.lng - start.lng) * progress;
    
    // Agregar variaciones para simular calles (no línea recta)
    const variation = 0.002; // Ajustar según sea necesario
    const streetVariation = Math.sin(progress * Math.PI * 4) * variation * (1 - Math.abs(progress - 0.5) * 2);
    
    // Aplicar variación perpendicular a la dirección principal
    const angle = Math.atan2(end.lat - start.lat, end.lng - start.lng);
    const perpAngle = angle + Math.PI / 2;
    
    lat += Math.sin(perpAngle) * streetVariation;
    lng += Math.cos(perpAngle) * streetVariation;
    
    // Agregar pequeñas variaciones aleatorias para más realismo
    const randomVariation = 0.0005;
    lat += (Math.random() - 0.5) * randomVariation;
    lng += (Math.random() - 0.5) * randomVariation;
    
    route.push([lat, lng]);
  }
  
  // Agregar punto final
  route.push([end.lat, end.lng]);
  
  return route;
}

// Generar ruta que simula seguir calles reales
export function generateRealisticRoute(start: Point, end: Point): [number, number][] {
  const route: [number, number][] = [];
  
  // Calcular la dirección principal
  const deltaLat = end.lat - start.lat;
  const deltaLng = end.lng - start.lng;
  const distance = calculateDistance(start, end);
  
  // Número de segmentos basado en la distancia
  const segmentsPerKm = 8;
  const numSegments = Math.max(6, Math.floor(distance * segmentsPerKm));
  
  route.push([start.lat, start.lng]);
  
  for (let i = 1; i < numSegments; i++) {
    const progress = i / numSegments;
    
    // Posición base en línea recta
    let lat = start.lat + deltaLat * progress;
    let lng = start.lng + deltaLng * progress;
    
    // Crear patrón de calles en cuadrícula
    const gridSize = 0.003; // Tamaño de la cuadrícula
    const streetPattern = 0.001; // Variación para simular calles
    
    // Simular movimiento en cuadrícula (como calles reales)
    if (progress < 0.3) {
      // Primero moverse más horizontalmente
      lng += Math.sin(progress * Math.PI * 3) * streetPattern;
      lat += Math.cos(progress * Math.PI * 2) * streetPattern * 0.5;
    } else if (progress < 0.7) {
      // Luego más verticalmente
      lat += Math.sin(progress * Math.PI * 4) * streetPattern;
      lng += Math.cos(progress * Math.PI * 3) * streetPattern * 0.5;
    } else {
      // Finalmente directo al destino
      const straightFactor = (progress - 0.7) / 0.3;
      const variation = (1 - straightFactor) * streetPattern;
      lng += Math.sin(progress * Math.PI * 2) * variation;
      lat += Math.cos(progress * Math.PI * 2) * variation;
    }
    
    route.push([lat, lng]);
  }
  
  route.push([end.lat, end.lng]);
  return route;
}

// Generar ruta tipo Manhattan (calles en cuadrícula)
export function generateManhattanRoute(start: Point, end: Point): [number, number][] {
  const route: [number, number][] = [];
  
  route.push([start.lat, start.lng]);
  
  const deltaLat = end.lat - start.lat;
  const deltaLng = end.lng - start.lng;
  
  // Decidir si ir primero horizontal o vertical
  const goHorizontalFirst = Math.abs(deltaLng) > Math.abs(deltaLat);
  
  if (goHorizontalFirst) {
    // Ir horizontal primero, luego vertical
    const midPoint = [start.lat, end.lng];
    
    // Agregar puntos intermedios horizontales
    const horizontalSteps = Math.max(3, Math.floor(Math.abs(deltaLng) * 1000));
    for (let i = 1; i < horizontalSteps; i++) {
      const progress = i / horizontalSteps;
      const lng = start.lng + deltaLng * progress;
      route.push([start.lat + Math.sin(progress * Math.PI) * 0.0005, lng]);
    }
    
    route.push(midPoint as [number, number]);
    
    // Agregar puntos intermedios verticales
    const verticalSteps = Math.max(3, Math.floor(Math.abs(deltaLat) * 1000));
    for (let i = 1; i < verticalSteps; i++) {
      const progress = i / verticalSteps;
      const lat = start.lat + deltaLat * progress;
      route.push([lat, end.lng + Math.sin(progress * Math.PI) * 0.0005]);
    }
  } else {
    // Ir vertical primero, luego horizontal
    const midPoint = [end.lat, start.lng];
    
    // Agregar puntos intermedios verticales
    const verticalSteps = Math.max(3, Math.floor(Math.abs(deltaLat) * 1000));
    for (let i = 1; i < verticalSteps; i++) {
      const progress = i / verticalSteps;
      const lat = start.lat + deltaLat * progress;
      route.push([lat, start.lng + Math.sin(progress * Math.PI) * 0.0005]);
    }
    
    route.push(midPoint as [number, number]);
    
    // Agregar puntos intermedios horizontales
    const horizontalSteps = Math.max(3, Math.floor(Math.abs(deltaLng) * 1000));
    for (let i = 1; i < horizontalSteps; i++) {
      const progress = i / horizontalSteps;
      const lng = start.lng + deltaLng * progress;
      route.push([end.lat + Math.sin(progress * Math.PI) * 0.0005, lng]);
    }
  }
  
  route.push([end.lat, end.lng]);
  return route;
}

// Función principal que intenta OSRM primero, luego usa generación local
export async function getOptimalRoute(start: Point, end: Point): Promise<[number, number][]> {
  console.log('🔄 Intentando obtener ruta real de OSRM...');
  
  try {
    // Intentar OSRM con timeout más largo para dar más tiempo
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos
    
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
      { 
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates;
        const leafletCoords: [number, number][] = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        console.log('✅ Ruta real obtenida de OSRM con', leafletCoords.length, 'puntos');
        return leafletCoords;
      }
    }
    
    throw new Error(`OSRM respuesta no válida: ${response.status}`);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⏰ Timeout de OSRM, usando ruta local...');
    } else {
      console.log('❌ Error de OSRM:', error.message, '- usando ruta local...');
    }
    
    // Fallback: usar línea recta con muchos puntos para suavizar
    const steps = 30;
    const coords: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const lat = start.lat + (end.lat - start.lat) * ratio;
      const lng = start.lng + (end.lng - start.lng) * ratio;
      coords.push([lat, lng]);
    }
    console.log('✅ Ruta fallback generada con', coords.length, 'puntos');
    return coords;
  }
}