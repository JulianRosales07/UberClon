interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  location: Location;
  isAvailable: boolean;
  totalTrips: number;
}

interface Trip {
  id: string;
  passengerId: string;
  driverId: string;
  pickup: Location;
  destination: Location;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  fare: number;
  estimatedTime: number;
  distance: number;
  createdAt: Date;
  completedAt?: Date;
  driver: Driver;
}

// Simulación de conductores cercanos
export const getNearbyDrivers = (location: Location): Promise<Driver[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockDrivers: Driver[] = [
        {
          id: '1',
          name: 'Juan Carlos Pérez',
          rating: 4.9,
          vehicleInfo: {
            make: 'Toyota',
            model: 'Corolla',
            year: 2020,
            color: 'Blanco',
            licensePlate: 'ABC-123'
          },
          location: {
            lat: location.lat + 0.01,
            lng: location.lng + 0.01,
            address: 'Cerca de ti'
          },
          isAvailable: true,
          totalTrips: 1250
        },
        {
          id: '2',
          name: 'María González',
          rating: 4.8,
          vehicleInfo: {
            make: 'Chevrolet',
            model: 'Spark',
            year: 2019,
            color: 'Azul',
            licensePlate: 'DEF-456'
          },
          location: {
            lat: location.lat - 0.005,
            lng: location.lng + 0.008,
            address: 'Cerca de ti'
          },
          isAvailable: true,
          totalTrips: 890
        },
        {
          id: '3',
          name: 'Carlos Rodríguez',
          rating: 4.7,
          vehicleInfo: {
            make: 'Nissan',
            model: 'Versa',
            year: 2021,
            color: 'Gris',
            licensePlate: 'GHI-789'
          },
          location: {
            lat: location.lat + 0.008,
            lng: location.lng - 0.003,
            address: 'Cerca de ti'
          },
          isAvailable: true,
          totalTrips: 2100
        }
      ];
      resolve(mockDrivers);
    }, 1000);
  });
};

// Simular solicitud de viaje
export const requestRide = (pickup: Location, destination: Location, fare: number): Promise<Trip> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simular que un conductor acepta el viaje
      const assignedDriver: Driver = {
        id: '1',
        name: 'Juan Carlos Pérez',
        rating: 4.9,
        vehicleInfo: {
          make: 'Toyota',
          model: 'Corolla',
          year: 2020,
          color: 'Blanco',
          licensePlate: 'ABC-123'
        },
        location: pickup,
        isAvailable: false,
        totalTrips: 1250
      };

      const trip: Trip = {
        id: Math.random().toString(36).substr(2, 9),
        passengerId: 'current-user',
        driverId: assignedDriver.id,
        pickup,
        destination,
        status: 'accepted',
        fare,
        estimatedTime: 8,
        distance: 5.2,
        createdAt: new Date(),
        driver: assignedDriver
      };

      resolve(trip);
    }, 3000); // Simular 3 segundos de búsqueda
  });
};

// Simular actualización del estado del viaje
export const updateTripStatus = (tripId: string, status: Trip['status']): Promise<Trip> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Aquí normalmente harías una llamada a la API
      // Por ahora solo simulamos la respuesta
      resolve({} as Trip);
    }, 1000);
  });
};