import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  rating: number;
  userType: 'passenger' | 'driver';
}

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface Trip {
  id: string;
  passengerId: string;
  driverId?: string;
  pickup: Location;
  destination: Location;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  fare: number;
  estimatedTime: number;
  distance: number;
  createdAt: Date;
  completedAt?: Date;
}

interface RideRequest {
  pickup: Location;
  destination: Location;
  estimatedFare: number;
  estimatedTime: number;
  distance: number;
}

interface Driver extends User {
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

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Location state
  currentLocation: Location | null;
  pickupLocation: Location | null;
  destinationLocation: Location | null;
  
  // Trip state
  currentTrip: Trip | null;
  rideRequest: RideRequest | null;
  nearbyDrivers: Driver[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setCurrentLocation: (location: Location) => void;
  setPickupLocation: (location: Location) => void;
  setDestinationLocation: (location: Location) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  setRideRequest: (request: RideRequest | null) => void;
  setNearbyDrivers: (drivers: Driver[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  currentLocation: null,
  pickupLocation: null,
  destinationLocation: null,
  currentTrip: null,
  rideRequest: null,
  nearbyDrivers: [],
  isLoading: false,
  error: null,
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setPickupLocation: (location) => set({ pickupLocation: location }),
  setDestinationLocation: (location) => set({ destinationLocation: location }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  setRideRequest: (request) => set({ rideRequest: request }),
  setNearbyDrivers: (drivers) => set({ nearbyDrivers: drivers }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  logout: () => set({ 
    user: null, 
    isAuthenticated: false, 
    currentTrip: null, 
    rideRequest: null,
    pickupLocation: null,
    destinationLocation: null
  }),
}));