interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Tu ubicación actual'
        });
      },
      (error) => {
        // Fallback to Bogotá
        resolve({
          lat: 4.6097,
          lng: -74.0817,
          address: 'Bogotá, Colombia'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
};

export const searchLocations = async (query: string): Promise<Location[]> => {
  // Simulación de búsqueda de ubicaciones
  const mockResults: Location[] = [
    { lat: 4.6097, lng: -74.0817, address: `${query} - Centro, Bogotá` },
    { lat: 4.6351, lng: -74.0703, address: `${query} - Zona Rosa, Bogotá` },
    { lat: 4.5981, lng: -74.0758, address: `${query} - Chapinero, Bogotá` },
    { lat: 4.6482, lng: -74.0776, address: `${query} - Usaquén, Bogotá` },
  ];
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockResults), 300);
  });
};