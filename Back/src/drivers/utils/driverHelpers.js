const { calculateDistance, isWithinRadius } = require('../../shared/utils/distanceCalculator');

const calculateDriverRating = async (driverId, Trip) => {
  // Esta función calculará el rating promedio basado en las calificaciones de los viajes
  // Por ahora retorna un valor base, pero se puede expandir cuando implementes el sistema de ratings
  
  const completedTrips = await Trip.find({
    driverId,
    status: 'completed'
  }).select('rating');

  if (completedTrips.length === 0) {
    return 5.0; // Rating inicial
  }

  const totalRating = completedTrips.reduce((sum, trip) => {
    return sum + (trip.rating || 5.0);
  }, 0);

  return Math.round((totalRating / completedTrips.length) * 10) / 10;
};

const isDriverAvailable = (driver) => {
  return driver.driverInfo && 
         driver.driverInfo.isAvailable && 
         driver.isActive &&
         driver.role === 'driver';
};

const calculateDriverEarnings = (trips) => {
  const totalEarnings = trips.reduce((sum, trip) => {
    return sum + (trip.finalPrice || trip.estimatedPrice || 0);
  }, 0);

  const platformFee = totalEarnings * 0.20; // 20% comisión
  const netEarnings = totalEarnings - platformFee;

  return {
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    netEarnings: Math.round(netEarnings * 100) / 100,
    tripCount: trips.length,
    averageEarningsPerTrip: trips.length > 0 ? 
      Math.round((totalEarnings / trips.length) * 100) / 100 : 0
  };
};

const findNearbyDrivers = async (lat, lng, radiusKm, User) => {
  // Buscar conductores disponibles en un radio específico
  const drivers = await User.find({
    role: 'driver',
    'driverInfo.isAvailable': true,
    'driverInfo.currentLocation.lat': { $exists: true },
    'driverInfo.currentLocation.lng': { $exists: true },
    isActive: true
  }).populate('driverInfo.vehicleId');

  // Filtrar por distancia
  const nearbyDrivers = drivers.filter(driver => {
    if (!driver.driverInfo.currentLocation) return false;
    
    return isWithinRadius(
      lat, lng,
      driver.driverInfo.currentLocation.lat,
      driver.driverInfo.currentLocation.lng,
      radiusKm
    );
  });

  // Agregar distancia a cada conductor y ordenar por proximidad
  return nearbyDrivers.map(driver => {
    const distance = calculateDistance(
      lat, lng,
      driver.driverInfo.currentLocation.lat,
      driver.driverInfo.currentLocation.lng
    );

    return {
      ...driver.toObject(),
      distance: Math.round(distance * 100) / 100
    };
  }).sort((a, b) => a.distance - b.distance);
};

const validateVehicleData = (vehicleData) => {
  const { make, model, year, color, licensePlate } = vehicleData;
  const errors = [];

  if (!make || make.trim().length < 2) {
    errors.push('La marca debe tener al menos 2 caracteres');
  }

  if (!model || model.trim().length < 1) {
    errors.push('El modelo es requerido');
  }

  const currentYear = new Date().getFullYear();
  if (!year || year < 1990 || year > currentYear + 1) {
    errors.push(`El año debe estar entre 1990 y ${currentYear + 1}`);
  }

  if (!color || color.trim().length < 2) {
    errors.push('El color debe tener al menos 2 caracteres');
  }

  if (!licensePlate || licensePlate.trim().length < 3) {
    errors.push('La placa debe tener al menos 3 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const generateDriverCode = (driverId) => {
  const timestamp = Date.now().toString(36);
  const driverIdShort = driverId.toString().slice(-4);
  return `DRV-${driverIdShort}-${timestamp}`.toUpperCase();
};

const calculateDriverPerformance = (stats) => {
  const {
    totalTrips,
    totalEarnings,
    rating,
    completionRate = 100,
    responseTime = 0
  } = stats;

  let performanceScore = 0;

  // Rating (40% del score)
  performanceScore += (rating / 5) * 40;

  // Tasa de finalización (30% del score)
  performanceScore += (completionRate / 100) * 30;

  // Número de viajes (20% del score) - normalizado
  const tripScore = Math.min(totalTrips / 100, 1) * 20;
  performanceScore += tripScore;

  // Tiempo de respuesta (10% del score) - invertido (menos tiempo = mejor score)
  const responseScore = Math.max(0, (60 - responseTime) / 60) * 10;
  performanceScore += responseScore;

  return {
    score: Math.round(performanceScore * 10) / 10,
    rating: 'excellent', // Se puede categorizar basado en el score
    breakdown: {
      rating: Math.round((rating / 5) * 40 * 10) / 10,
      completion: Math.round((completionRate / 100) * 30 * 10) / 10,
      experience: Math.round(tripScore * 10) / 10,
      response: Math.round(responseScore * 10) / 10
    }
  };
};

const formatDriverForResponse = (driver) => {
  const driverObject = driver.toObject ? driver.toObject() : driver;
  
  // Remover información sensible
  delete driverObject.password;
  
  return {
    ...driverObject,
    driverInfo: {
      ...driverObject.driverInfo,
      rating: Math.round(driverObject.driverInfo.rating * 10) / 10,
      totalEarnings: Math.round(driverObject.driverInfo.totalEarnings * 100) / 100
    }
  };
};

const canAcceptTrip = (driver, trip) => {
  if (!isDriverAvailable(driver)) {
    return { canAccept: false, reason: 'El conductor no está disponible' };
  }

  if (trip.status !== 'pending') {
    return { canAccept: false, reason: 'El viaje ya no está disponible' };
  }

  if (trip.driverId) {
    return { canAccept: false, reason: 'El viaje ya fue aceptado por otro conductor' };
  }

  return { canAccept: true };
};

module.exports = {
  calculateDriverRating,
  isDriverAvailable,
  calculateDriverEarnings,
  findNearbyDrivers,
  validateVehicleData,
  generateDriverCode,
  calculateDriverPerformance,
  formatDriverForResponse,
  canAcceptTrip
};