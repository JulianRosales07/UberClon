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

interface MusicRequest {
  id: string;
  song: string;
  artist?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'playing';
  timestamp: Date;
  tripId: string;
  passengerId: string;
  driverId: string;
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
  
  // Music state
  musicRequests: MusicRequest[];
  currentlyPlaying: MusicRequest | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showLogin: 'passenger' | 'driver' | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setCurrentLocation: (location: Location) => void;
  setPickupLocation: (location: Location | null) => void;
  setDestinationLocation: (location: Location | null) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  setRideRequest: (request: RideRequest | null) => void;
  setNearbyDrivers: (drivers: Driver[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
  setShowLogin: (type: 'passenger' | 'driver' | null) => void;
  
  // Music actions
  addMusicRequest: (request: Omit<MusicRequest, 'id' | 'timestamp'>) => void;
  updateMusicRequestStatus: (id: string, status: MusicRequest['status']) => void;
  setCurrentlyPlaying: (request: MusicRequest | null) => void;
  clearMusicRequests: () => void;
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
  musicRequests: [],
  currentlyPlaying: null,
  isLoading: false,
  error: null,
  showLogin: null,
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user, showLogin: null }),
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
    destinationLocation: null,
    musicRequests: [],
    currentlyPlaying: null,
    showLogin: null
  }),
  setShowLogin: (type) => set({ showLogin: type }),
  
  // Music actions
  addMusicRequest: (request) => set((state) => ({
    musicRequests: [...state.musicRequests, {
      ...request,
      id: Date.now().toString(),
      timestamp: new Date()
    }]
  })),
  
  updateMusicRequestStatus: (id, status) => set((state) => ({
    musicRequests: state.musicRequests.map(req => 
      req.id === id ? { ...req, status } : req
    ),
    currentlyPlaying: status === 'playing' 
      ? state.musicRequests.find(req => req.id === id) || null
      : state.currentlyPlaying?.id === id 
        ? null 
        : state.currentlyPlaying
  })),
  
  setCurrentlyPlaying: (request) => set({ currentlyPlaying: request }),
  
  clearMusicRequests: () => set({ musicRequests: [], currentlyPlaying: null }),
}));