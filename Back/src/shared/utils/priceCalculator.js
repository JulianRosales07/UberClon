const calculateTripPrice = (distance, tripType = 'standard', timeOfDay = 'normal') => {
  // Precios base por kilómetro según el tipo de viaje
  const basePrices = {
    standard: 2.5,
    premium: 4.0,
    shared: 1.8
  };

  // Multiplicadores según la hora del día
  const timeMultipliers = {
    normal: 1.0,
    peak: 1.5,    // Horas pico
    night: 1.2    // Horario nocturno
  };

  const basePrice = basePrices[tripType] || basePrices.standard;
  const timeMultiplier = timeMultipliers[timeOfDay] || timeMultipliers.normal;
  const minimumFare = 5.0; // Tarifa mínima

  // Cálculo del precio
  let calculatedPrice = distance * basePrice * timeMultiplier;

  // Aplicar tarifa mínima
  calculatedPrice = Math.max(calculatedPrice, minimumFare);

  // Redondear a 2 decimales
  return Math.round(calculatedPrice * 100) / 100;
};

const getPeakTimeMultiplier = () => {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay(); // 0 = Domingo, 6 = Sábado

  // Horas pico en días laborables: 7-9 AM y 5-7 PM
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return 'peak';
    }
  }

  // Horario nocturno: 10 PM - 6 AM
  if (hour >= 22 || hour <= 6) {
    return 'night';
  }

  return 'normal';
};

const calculateSurgePrice = (basePrice, demandLevel = 'normal') => {
  const surgeMultipliers = {
    low: 0.8,      // Baja demanda
    normal: 1.0,   // Demanda normal
    high: 1.3,     // Alta demanda
    very_high: 1.6, // Muy alta demanda
    extreme: 2.0   // Demanda extrema
  };

  const multiplier = surgeMultipliers[demandLevel] || surgeMultipliers.normal;
  return Math.round(basePrice * multiplier * 100) / 100;
};

const calculateEstimatedEarnings = (tripPrice, platformFeePercentage = 20) => {
  const platformFee = tripPrice * (platformFeePercentage / 100);
  const driverEarnings = tripPrice - platformFee;

  return {
    tripPrice,
    platformFee: Math.round(platformFee * 100) / 100,
    driverEarnings: Math.round(driverEarnings * 100) / 100,
    platformFeePercentage
  };
};

const calculateDistancePrice = (distance, tripType = 'standard') => {
  // Precio base por distancia (primeros 5 km)
  const baseDistance = 5;
  const basePrices = {
    standard: 12.0,
    premium: 18.0,
    shared: 8.0
  };

  // Precio por km adicional después de los primeros 5 km
  const additionalPrices = {
    standard: 2.0,
    premium: 3.0,
    shared: 1.5
  };

  const basePrice = basePrices[tripType] || basePrices.standard;
  const additionalPrice = additionalPrices[tripType] || additionalPrices.standard;

  if (distance <= baseDistance) {
    return basePrice;
  }

  const additionalDistance = distance - baseDistance;
  const totalPrice = basePrice + (additionalDistance * additionalPrice);

  return Math.round(totalPrice * 100) / 100;
};

const calculateTimePrice = (estimatedMinutes, tripType = 'standard') => {
  // Precio por minuto según el tipo de viaje
  const timePrices = {
    standard: 0.5,
    premium: 0.8,
    shared: 0.3
  };

  const timePrice = timePrices[tripType] || timePrices.standard;
  const totalTimePrice = estimatedMinutes * timePrice;

  return Math.round(totalTimePrice * 100) / 100;
};

const calculateTotalPrice = (distance, estimatedMinutes, tripType = 'standard', timeOfDay = 'normal') => {
  // Calcular precio por distancia
  const distancePrice = calculateDistancePrice(distance, tripType);
  
  // Calcular precio por tiempo
  const timePrice = calculateTimePrice(estimatedMinutes, tripType);
  
  // Precio base combinado
  let totalPrice = distancePrice + timePrice;
  
  // Aplicar multiplicador de hora
  const timeMultiplier = getPeakTimeMultiplier() === 'peak' ? 1.5 : 
                        getPeakTimeMultiplier() === 'night' ? 1.2 : 1.0;
  
  totalPrice *= timeMultiplier;
  
  // Tarifa mínima
  const minimumFare = 8.0;
  totalPrice = Math.max(totalPrice, minimumFare);

  return Math.round(totalPrice * 100) / 100;
};

module.exports = {
  calculateTripPrice,
  getPeakTimeMultiplier,
  calculateSurgePrice,
  calculateEstimatedEarnings,
  calculateDistancePrice,
  calculateTimePrice,
  calculateTotalPrice
};