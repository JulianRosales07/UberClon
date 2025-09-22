// Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Redondear a 2 decimales
};

// Función auxiliar para convertir grados a radianes
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Función para calcular el tiempo estimado de viaje
const calculateEstimatedTime = (distance, trafficFactor = 1.0) => {
  // Velocidad promedio en ciudad: 30 km/h
  // Velocidad promedio en carretera: 60 km/h
  
  let averageSpeed;
  if (distance < 5) {
    averageSpeed = 25; // Ciudad, tráfico denso
  } else if (distance < 20) {
    averageSpeed = 40; // Suburbios
  } else {
    averageSpeed = 55; // Carretera
  }

  // Aplicar factor de tráfico
  averageSpeed = averageSpeed / trafficFactor;
  
  // Calcular tiempo en horas y convertir a minutos
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = timeInHours * 60;
  
  return Math.round(timeInMinutes);
};

// Función para obtener el factor de tráfico según la hora
const getTrafficFactor = () => {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  
  // Factor de tráfico más alto en horas pico
  if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Días laborables
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return 1.8; // Tráfico pesado
    } else if ((hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 20)) {
      return 1.4; // Tráfico moderado
    }
  }
  
  // Fines de semana - tráfico más ligero excepto en ciertas horas
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    if (hour >= 12 && hour <= 18) {
      return 1.2; // Tráfico ligero-moderado
    }
  }
  
  return 1.0; // Tráfico normal
};

// Función para calcular múltiples rutas y encontrar la más eficiente
const calculateOptimalRoute = (origin, destination, waypoints = []) => {
  const routes = [];
  
  if (waypoints.length === 0) {
    // Ruta directa
    const distance = calculateDistance(
      origin.lat, origin.lng,
      destination.lat, destination.lng
    );
    const trafficFactor = getTrafficFactor();
    const estimatedTime = calculateEstimatedTime(distance, trafficFactor);
    
    routes.push({
      type: 'direct',
      distance,
      estimatedTime,
      waypoints: []
    });
  } else {
    // Calcular rutas con puntos intermedios
    // Esta es una implementación simplificada
    let totalDistance = 0;
    let currentPoint = origin;
    
    for (const waypoint of waypoints) {
      const segmentDistance = calculateDistance(
        currentPoint.lat, currentPoint.lng,
        waypoint.lat, waypoint.lng
      );
      totalDistance += segmentDistance;
      currentPoint = waypoint;
    }
    
    // Último segmento al destino
    const finalDistance = calculateDistance(
      currentPoint.lat, currentPoint.lng,
      destination.lat, destination.lng
    );
    totalDistance += finalDistance;
    
    const trafficFactor = getTrafficFactor();
    const estimatedTime = calculateEstimatedTime(totalDistance, trafficFactor);
    
    routes.push({
      type: 'with_waypoints',
      distance: totalDistance,
      estimatedTime,
      waypoints
    });
  }
  
  // Retornar la ruta más eficiente (por ahora solo hay una)
  return routes[0];
};

// Función para verificar si un punto está dentro de un radio específico
const isWithinRadius = (centerLat, centerLng, pointLat, pointLng, radiusKm) => {
  const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng);
  return distance <= radiusKm;
};

// Función para calcular el punto medio entre dos coordenadas
const calculateMidpoint = (lat1, lng1, lat2, lng2) => {
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const lng1Rad = toRadians(lng1);
  
  const bx = Math.cos(lat2Rad) * Math.cos(dLng);
  const by = Math.cos(lat2Rad) * Math.sin(dLng);
  
  const midLat = Math.atan2(
    Math.sin(lat1Rad) + Math.sin(lat2Rad),
    Math.sqrt((Math.cos(lat1Rad) + bx) * (Math.cos(lat1Rad) + bx) + by * by)
  );
  
  const midLng = lng1Rad + Math.atan2(by, Math.cos(lat1Rad) + bx);
  
  return {
    lat: midLat * (180 / Math.PI),
    lng: midLng * (180 / Math.PI)
  };
};

// Función para calcular el área de cobertura de servicio
const calculateServiceArea = (centerLat, centerLng, maxRadiusKm) => {
  // Calcular los límites del área de servicio
  const latDelta = maxRadiusKm / 111; // Aproximadamente 111 km por grado de latitud
  const lngDelta = maxRadiusKm / (111 * Math.cos(toRadians(centerLat)));
  
  return {
    center: { lat: centerLat, lng: centerLng },
    bounds: {
      north: centerLat + latDelta,
      south: centerLat - latDelta,
      east: centerLng + lngDelta,
      west: centerLng - lngDelta
    },
    radius: maxRadiusKm
  };
};

module.exports = {
  calculateDistance,
  calculateEstimatedTime,
  getTrafficFactor,
  calculateOptimalRoute,
  isWithinRadius,
  calculateMidpoint,
  calculateServiceArea,
  toRadians
};