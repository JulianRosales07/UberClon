const { calculateDistance, calculateEstimatedTime, getTrafficFactor } = require('../../shared/utils/distanceCalculator');
const { calculateTripPrice, getPeakTimeMultiplier } = require('../../shared/utils/priceCalculator');

const validateTripCoordinates = (origin, destination) => {
  // Validar que las coordenadas estén en rangos válidos
  if (Math.abs(origin.coordinates.lat) > 90 || Math.abs(destination.coordinates.lat) > 90) {
    throw new Error('Latitud debe estar entre -90 y 90 grados');
  }

  if (Math.abs(origin.coordinates.lng) > 180 || Math.abs(destination.coordinates.lng) > 180) {
    throw new Error('Longitud debe estar entre -180 y 180 grados');
  }

  // Validar que origen y destino no sean el mismo punto
  const distance = calculateDistance(
    origin.coordinates.lat,
    origin.coordinates.lng,
    destination.coordinates.lat,
    destination.coordinates.lng
  );

  if (distance < 0.1) { // Menos de 100 metros
    throw new Error('El origen y destino deben estar separados por al menos 100 metros');
  }

  return true;
};

const calculateTripEstimates = (origin, destination, tripType = 'standard') => {
  const distance = calculateDistance(
    origin.coordinates.lat,
    origin.coordinates.lng,
    destination.coordinates.lat,
    destination.coordinates.lng
  );

  const trafficFactor = getTrafficFactor();
  const estimatedTime = calculateEstimatedTime(distance, trafficFactor);
  const timeOfDay = getPeakTimeMultiplier();
  const estimatedPrice = calculateTripPrice(distance, tripType, timeOfDay);

  return {
    distance: Math.round(distance * 100) / 100,
    estimatedTime,
    estimatedPrice,
    timeOfDay,
    trafficFactor
  };
};

const generateTripCode = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TRIP-${timestamp}-${random}`.toUpperCase();
};

const canCancelTrip = (trip, userId, userRole) => {
  // No se puede cancelar si ya está completado
  if (trip.status === 'completed') {
    return { canCancel: false, reason: 'No se puede cancelar un viaje completado' };
  }

  // El pasajero puede cancelar si el viaje está pending o accepted
  if (trip.passengerId.toString() === userId) {
    if (['pending', 'accepted'].includes(trip.status)) {
      return { canCancel: true };
    }
    if (trip.status === 'in_progress') {
      return { canCancel: false, reason: 'No se puede cancelar un viaje en progreso' };
    }
  }

  // El conductor puede cancelar si el viaje está accepted
  if (trip.driverId && trip.driverId.toString() === userId) {
    if (trip.status === 'accepted') {
      return { canCancel: true };
    }
    if (trip.status === 'in_progress') {
      return { canCancel: false, reason: 'No se puede cancelar un viaje en progreso' };
    }
  }

  // Los admins pueden cancelar cualquier viaje excepto completados
  if (userRole === 'admin' && trip.status !== 'completed') {
    return { canCancel: true };
  }

  return { canCancel: false, reason: 'No tienes permisos para cancelar este viaje' };
};

const calculateCancellationFee = (trip) => {
  const timeSinceAccepted = trip.acceptedAt ? 
    (new Date() - new Date(trip.acceptedAt)) / (1000 * 60) : 0; // minutos

  // Si han pasado más de 5 minutos desde que se aceptó, cobrar fee
  if (timeSinceAccepted > 5) {
    return Math.min(trip.estimatedPrice * 0.1, 5.0); // 10% del precio o $5, lo que sea menor
  }

  return 0;
};

const getTripStatusFlow = (currentStatus) => {
  const statusFlow = {
    pending: ['accepted', 'cancelled'],
    accepted: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  return statusFlow[currentStatus] || [];
};

const isValidStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = getTripStatusFlow(currentStatus);
  return allowedTransitions.includes(newStatus);
};

const formatTripForResponse = (trip) => {
  const tripObject = trip.toObject ? trip.toObject() : trip;
  
  return {
    ...tripObject,
    estimatedPrice: Math.round(tripObject.estimatedPrice * 100) / 100,
    finalPrice: tripObject.finalPrice ? Math.round(tripObject.finalPrice * 100) / 100 : null,
    duration: tripObject.startedAt && tripObject.completedAt ? 
      Math.round((new Date(tripObject.completedAt) - new Date(tripObject.startedAt)) / (1000 * 60)) : null
  };
};

module.exports = {
  validateTripCoordinates,
  calculateTripEstimates,
  generateTripCode,
  canCancelTrip,
  calculateCancellationFee,
  getTripStatusFlow,
  isValidStatusTransition,
  formatTripForResponse
};