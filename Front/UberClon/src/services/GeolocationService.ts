interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface GeolocationPosition {
  coordinates: Location;
  accuracy: number;
  timestamp: number;
  address?: string;
}

interface RouteResponse {
  geometry?: {
    coordinates: [number, number][];
  };
  distance?: number;
  duration?: number;
}

class GeolocationService {
  private authToken: string | null = null;
  private baseUrl: string = '/api';

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Get current position using browser geolocation
   */
  async getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: GeolocationPosition = {
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          // Try to get address
          try {
            const address = await this.reverseGeocode(location.coordinates);
            location.address = address;
            location.coordinates.address = address;
          } catch (error) {
            console.warn('Failed to get address:', error);
          }

          resolve(location);
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
          ...options
        }
      );
    });
  }

  /**
   * Reverse geocoding - convert coordinates to address
   */
  async reverseGeocode(location: Location): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      return data.display_name || 'Dirección no encontrada';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Forward geocoding - convert address to coordinates
   */
  async geocode(address: string): Promise<Location> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      if (data.length === 0) {
        throw new Error('Address not found');
      }

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Calculate route between two points
   */
  async calculateRoute(
    origin: Location,
    destination: Location,
    mode: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<RouteResponse> {
    try {
      // Using OpenRouteService API (you might want to use your own backend)
      const profile = mode === 'driving' ? 'driving-car' : mode === 'cycling' ? 'cycling-regular' : 'foot-walking';
      
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/${profile}?api_key=YOUR_API_KEY&start=${origin.lng},${origin.lat}&end=${destination.lng},${destination.lat}`
      );

      if (!response.ok) {
        // Fallback to simple straight line
        return {
          geometry: {
            coordinates: [[origin.lng, origin.lat], [destination.lng, destination.lat]]
          },
          distance: this.calculateDistance(origin, destination),
          duration: 0
        };
      }

      const data = await response.json();
      return {
        geometry: data.features[0].geometry,
        distance: data.features[0].properties.segments[0].distance,
        duration: data.features[0].properties.segments[0].duration
      };
    } catch (error) {
      console.error('Route calculation error:', error);
      // Return straight line as fallback
      return {
        geometry: {
          coordinates: [[origin.lng, origin.lat], [destination.lng, destination.lat]]
        },
        distance: this.calculateDistance(origin, destination),
        duration: 0
      };
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Update user location on server
   */
  async updateUserLocation(position: GeolocationPosition): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/location`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          latitude: position.coordinates.lat,
          longitude: position.coordinates.lng,
          accuracy: position.accuracy,
          timestamp: position.timestamp,
          address: position.address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  /**
   * Get nearby drivers
   */
  async getNearbyDrivers(location: Location, radius: number = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/trips/nearby-drivers?lat=${location.lat}&lng=${location.lng}&radius=${radius}`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get nearby drivers');
      }

      const data = await response.json();
      return data.success ? data.data.drivers : [];
    } catch (error) {
      console.error('Error getting nearby drivers:', error);
      return [];
    }
  }

  /**
   * Get autocomplete suggestions for Pasto locations
   */
  async getAutocompleteSuggestions(query: string): Promise<any[]> {
    // Ubicaciones predefinidas de Pasto
    const pastoLocations = [
      {
        coordinates: { lat: 1.223789, lng: -77.283255 },
        text: 'Centro de Pasto, Nariño',
        main_text: 'Centro de Pasto',
        secondary_text: 'Pasto, Nariño'
      },
      {
        coordinates: { lat: 1.216386, lng: -77.288671 },
        text: 'Unicentro - Centro Comercial Unicentro',
        main_text: 'Unicentro',
        secondary_text: 'Centro Comercial, Pasto'
      },
      {
        coordinates: { lat: 1.226829, lng: -77.282465 },
        text: 'Avenida de los Estudiantes',
        main_text: 'Avenida de los Estudiantes',
        secondary_text: 'Pasto, Nariño'
      },
      {
        coordinates: { lat: 1.223802, lng: -77.283742 },
        text: 'Universidad Mariana',
        main_text: 'Universidad Mariana',
        secondary_text: 'Pasto, Nariño'
      },
      {
        coordinates: { lat: 1.205879, lng: -77.260628 },
        text: 'Único - Centro Comercial Único',
        main_text: 'Único',
        secondary_text: 'Centro Comercial, Pasto'
      },
      {
        coordinates: { lat: 1.204400, lng: -77.293005 },
        text: 'Tamasagra',
        main_text: 'Tamasagra',
        secondary_text: 'Pasto, Nariño'
      },
      {
        coordinates: { lat: 1.198087, lng: -77.278660 },
        text: 'Estadio Libertad',
        main_text: 'Estadio Libertad',
        secondary_text: 'Pasto, Nariño'
      },
      {
        coordinates: { lat: 1.218915, lng: -77.281944 },
        text: 'Parque Infantil',
        main_text: 'Parque Infantil',
        secondary_text: 'Pasto, Nariño'
      },
      {
        coordinates: { lat: 1.220019, lng: -77.298537 },
        text: 'Alvernia',
        main_text: 'Alvernia',
        secondary_text: 'Pasto, Nariño'
      }
    ];

    // Filtrar ubicaciones que coincidan con la búsqueda
    const filteredLocations = pastoLocations.filter(location =>
      location.text.toLowerCase().includes(query.toLowerCase()) ||
      location.main_text.toLowerCase().includes(query.toLowerCase())
    );

    return filteredLocations.slice(0, 5); // Máximo 5 sugerencias
  }

  /**
   * Get trip estimate
   */
  async getTripEstimate(origin: Location, destination: Location, tripType: string): Promise<any> {
    const distance = this.calculateDistance(origin, destination);
    const duration = Math.round(distance * 3); // Aproximadamente 3 minutos por km
    
    // Calcular precio basado en distancia y tipo de viaje
    let basePrice = 3500; // Precio base
    let pricePerKm = 2000; // Precio por km
    
    switch (tripType) {
      case 'premium':
        basePrice *= 1.5;
        pricePerKm *= 1.5;
        break;
      case 'shared':
        basePrice *= 0.8;
        pricePerKm *= 0.8;
        break;
    }
    
    const estimatedPrice = Math.round(basePrice + (distance * pricePerKm));
    
    return {
      route: {
        distance: distance * 1000, // Convertir a metros
        duration: duration * 60 // Convertir a segundos
      },
      pricing: {
        estimatedPrice,
        currency: 'COP'
      },
      formatted: {
        distance: `${distance.toFixed(1)} km`,
        duration: `${duration} min`,
        price: `$${estimatedPrice.toLocaleString('es-CO')} COP`
      }
    };
  }

  /**
   * Search places
   */
  async searchPlaces(query: string, location?: Location): Promise<Location[]> {
    // Usar nuestras ubicaciones predefinidas en lugar de la API externa
    const suggestions = await this.getAutocompleteSuggestions(query);
    return suggestions.map(suggestion => ({
      lat: suggestion.coordinates.lat,
      lng: suggestion.coordinates.lng,
      address: suggestion.text
    }));
  }
}

export default GeolocationService;