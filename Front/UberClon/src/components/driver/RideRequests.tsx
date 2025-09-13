import React, { useState, useEffect } from 'react';
import { RideRequest } from './RideRequest';

interface RideRequestData {
  id: string;
  fare: number;
  rating: number;
  pickupTime: number;
  pickupDistance: number;
  pickupAddress: string;
  tripTime: number;
  tripDistance: number;
  destinationAddress: string;
  serviceType: 'UberX' | 'UberPool' | 'UberBlack';
  isExclusive?: boolean;
}

interface RideRequestsProps {
  isOnline: boolean;
  onAcceptRide: (requestId: string) => void;
}

export const RideRequests: React.FC<RideRequestsProps> = ({
  isOnline,
  onAcceptRide
}) => {
  const [requests, setRequests] = useState<RideRequestData[]>([]);

  // Simulate incoming ride requests when online
  useEffect(() => {
    if (!isOnline) {
      setRequests([]);
      return;
    }

    const generateRequest = (): RideRequestData => {
      const pickupLocations = [
        'Cra 22d #717, Genoy, Pasto',
        'Centro Comercial Unicentro, Pasto',
        'Terminal de Transporte, Pasto',
        'Universidad de Nariño, Pasto',
        'Aeropuerto Antonio Nariño, Chachagüí',
        'Plaza de Nariño, Centro, Pasto',
        'Hospital Departamental, Pasto'
      ];

      const destinations = [
        'Calle 18 #34-104, Universidad Mariana, Pasto',
        'Av. Panamericana, La Aurora, Pasto',
        'Calle 11 No. 34-78, Unicentro, Pasto',
        'Carrera 6 #12-50, Centro, Pasto',
        'Barrio Torobajo, Pasto',
        'Ciudadela Universitaria, Pasto',
        'Barrio San Vicente, Pasto'
      ];

      return {
        id: Math.random().toString(36).substr(2, 9),
        fare: Math.random() * 15 + 5, // $5-20
        rating: Math.random() * 1 + 4, // 4.0-5.0
        pickupTime: Math.floor(Math.random() * 8) + 2, // 2-10 mins
        pickupDistance: Math.random() * 3 + 0.5, // 0.5-3.5 km
        pickupAddress: pickupLocations[Math.floor(Math.random() * pickupLocations.length)],
        tripTime: Math.floor(Math.random() * 20) + 5, // 5-25 mins
        tripDistance: Math.random() * 10 + 1, // 1-11 km
        destinationAddress: destinations[Math.floor(Math.random() * destinations.length)],
        serviceType: ['UberX', 'UberPool', 'UberBlack'][Math.floor(Math.random() * 3)] as any,
        isExclusive: Math.random() > 0.7
      };
    };

    // Add initial request after 3 seconds
    const initialTimeout = setTimeout(() => {
      setRequests([generateRequest()]);
    }, 3000);

    // Add new requests periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance every 10 seconds
        setRequests(prev => {
          if (prev.length < 3) { // Max 3 requests at once
            return [...prev, generateRequest()];
          }
          return prev;
        });
      }
    }, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isOnline]);

  const handleAccept = (requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
    onAcceptRide(requestId);
  };

  const handleDecline = (requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
  };

  if (!isOnline || requests.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 800 }}>
      {requests.map((request) => (
        <RideRequest
          key={request.id}
          request={request}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      ))}
    </div>
  );
};