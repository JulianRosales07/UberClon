interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export const calculateDistance = (point1: Location, point2: Location): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Redondear a 2 decimales
};

export const calculateFare = (distance: number, rideType: string = 'uberx'): number => {
  const baseFares = {
    uberx: { base: 3000, perKm: 2500 },
    comfort: { base: 4000, perKm: 3000 },
    premium: { base: 6000, perKm: 4500 }
  };
  
  const fare = baseFares[rideType as keyof typeof baseFares] || baseFares.uberx;
  return Math.round(fare.base + (distance * fare.perKm));
};

export const calculateEstimatedTime = (distance: number): number => {
  // Asumiendo velocidad promedio de 30 km/h en ciudad
  const avgSpeed = 30;
  const timeInHours = distance / avgSpeed;
  const timeInMinutes = timeInHours * 60;
  
  return Math.max(5, Math.round(timeInMinutes)); // Mínimo 5 minutos
};