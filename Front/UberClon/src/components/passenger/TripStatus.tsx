import React from 'react';
import { Map } from '../common/Map';
import { Button } from '../common/Button';
import { Phone, MessageCircle, Star, User, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

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

interface TripStatusProps {
  trip: Trip;
}

export const TripStatus: React.FC<TripStatusProps> = ({ trip }) => {
  const { setCurrentTrip } = useAppStore();

  const handleBack = () => {
    if (trip.status === 'completed') {
      setCurrentTrip(null);
    }
  };

  const getStatusMessage = () => {
    switch (trip.status) {
      case 'accepted':
        return 'Tu conductor está en camino';
      case 'in_progress':
        return 'En viaje hacia tu destino';
      case 'completed':
        return 'Viaje completado';
      default:
        return 'Buscando conductor...';
    }
  };

  const getStatusColor = () => {
    switch (trip.status) {
      case 'accepted':
        return 'text-blue-600';
      case 'in_progress':
        return 'text-green-600';
      case 'completed':
        return 'text-gray-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        {trip.status === 'completed' ? (
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
        ) : (
          <div className="w-10"></div>
        )}
        <h1 className="text-lg font-semibold">
          {trip.status === 'completed' ? 'Viaje completado' : 'Tu viaje'}
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1">
        <Map
          center={trip.pickup}
          pickup={trip.pickup}
          destination={trip.destination}
        />
      </div>
      
      <div className="bg-white p-6">
        <div className="text-center mb-6">
          <h3 className={`text-xl font-bold mb-2 ${getStatusColor()}`}>
            {getStatusMessage()}
          </h3>
          <p className="text-gray-600">
            Tiempo estimado: {trip.estimatedTime} minutos
          </p>
        </div>

        {trip.status === 'accepted' || trip.status === 'in_progress' ? (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Juan Carlos Pérez</h4>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">4.9</span>
                  <span className="text-xs text-gray-400">• 1,250 viajes</span>
                </div>
                <p className="text-sm text-gray-500">Toyota Corolla Blanco • ABC-123</p>
                {trip.status === 'accepted' && (
                  <p className="text-xs text-blue-600 font-medium">Llegará en 3 minutos</p>
                )}
                {trip.status === 'in_progress' && (
                  <p className="text-xs text-green-600 font-medium">En camino al destino</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary" title="Llamar">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary" title="Mensaje">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tarifa del viaje:</span>
            <span className="font-bold text-lg">${trip.fare.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Distancia:</span>
            <span className="font-semibold">{trip.distance} km</span>
          </div>
        </div>

        {trip.status === 'completed' && (
          <div className="mt-6">
            <Button className="w-full">
              Calificar viaje
            </Button>
          </div>
        )}

        {(trip.status === 'accepted' || trip.status === 'in_progress') && (
          <div className="mt-6">
            <Button variant="danger" className="w-full">
              Cancelar viaje
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};