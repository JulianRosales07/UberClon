import React, { useState, useEffect } from 'react';
import { Map } from '../common/Map';
import { Button } from '../common/Button';
import { Phone, MessageCircle, Star, User, Music, Navigation, Clock, MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MusicRequest } from './MusicRequest';
import { MusicRequestStatus } from './MusicRequestStatus';
import type { MusicRequestData } from '../../types/music';

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

interface InTripViewProps {
  trip: Trip;
  onTripComplete: () => void;
}

export const InTripView: React.FC<InTripViewProps> = ({ trip, onTripComplete }) => {
  const { setCurrentTrip } = useAppStore();
  const [showMusicRequest, setShowMusicRequest] = useState(false);
  const [musicRequests, setMusicRequests] = useState<MusicRequestData[]>([]);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(trip.estimatedTime);
  const [panelExpanded, setPanelExpanded] = useState(false);

  // Simular progreso del viaje
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (trip.estimatedTime * 60)); // Incremento por segundo
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onTripComplete();
          }, 1000);
          return 100;
        }
        return newProgress;
      });

      setTimeRemaining(prev => {
        const newTime = prev - (1/60); // Decrementar por segundo
        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trip.estimatedTime, onTripComplete]);

  const handleMusicRequest = (song: string, artist?: string, message?: string) => {
    const newRequest: MusicRequestData = {
      id: Date.now().toString(),
      song,
      artist,
      message,
      status: 'pending',
      timestamp: new Date()
    };

    setMusicRequests(prev => [...prev, newRequest]);

    // Simular respuesta del conductor
    setTimeout(() => {
      const responses = ['accepted', 'declined', 'playing'] as const;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMusicRequests(prev => 
        prev.map(req => 
          req.id === newRequest.id 
            ? { ...req, status: randomResponse }
            : req.status === 'playing' 
              ? { ...req, status: 'accepted' }
              : req
        )
      );
    }, 2000 + Math.random() * 3000);
  };

  const handleRetryMusicRequest = (requestId: string) => {
    setShowMusicRequest(true);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-green-600">🚗 En viaje</h1>
          <p className="text-sm text-gray-600">Dirigiéndose al destino</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso del viaje</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>Origen</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{Math.ceil(timeRemaining)} min restantes</span>
          </div>
          <div className="flex items-center space-x-1">
            <Navigation className="w-3 h-3" />
            <span>Destino</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <Map
          center={trip.pickup}
          pickup={trip.pickup}
          destination={trip.destination}
        />
      </div>
      
      {/* Collapsible Bottom Panel */}
      <div className={`bg-white transition-all duration-300 ease-in-out ${
        panelExpanded ? 'h-auto' : 'h-32'
      }`}>
        {/* Panel Header - Always Visible */}
        <div className="px-6 py-4 border-b border-gray-100">
          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Juan Carlos Pérez</h4>
                <p className="text-sm text-green-600">🚗 En camino • {Math.ceil(timeRemaining)} min restantes</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <Button size="sm" variant="secondary" title="Llamar">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary" title="Mensaje">
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  title="Solicitar música"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMusicRequest(true);
                  }}
                >
                  <Music className="w-4 h-4" />
                </Button>
              </div>
              {panelExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
        </div>

        {/* Expandable Content */}
        <div className={`overflow-hidden transition-all duration-300 ${
          panelExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-6">
            {/* Solicitudes de Música */}
            <MusicRequestStatus 
              requests={musicRequests}
              onRetry={handleRetryMusicRequest}
            />

            {/* Driver Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-1 mb-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">4.9</span>
                <span className="text-xs text-gray-400">• 1,250 viajes</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Toyota Corolla Blanco • ABC-123</p>
              <p className="text-xs text-green-600 font-medium">
                📍 Distancia: {trip.distance} km
              </p>
            </div>

            {/* Trip Details */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">Detalles del viaje</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Tarifa estimada:</span>
                  <span className="font-bold text-blue-900">${trip.fare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Distancia:</span>
                  <span className="font-semibold text-blue-900">{trip.distance} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Tiempo estimado:</span>
                  <span className="font-semibold text-blue-900">{trip.estimatedTime} min</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700"
                onClick={() => setShowMusicRequest(true)}
              >
                <Music className="w-5 h-5" />
                <span>Solicitar Música al Conductor</span>
              </Button>
              
              <Button variant="danger" className="w-full">
                Reportar problema
              </Button>
            </div>

            {/* Safety Info */}
            <div className="mt-4 bg-green-50 rounded-lg p-3">
              <p className="text-sm text-green-700 text-center">
                🛡️ <strong>Viaje seguro:</strong> Tu ubicación se comparte en tiempo real. 
                Puedes contactar al conductor o reportar cualquier problema.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Solicitud de Música */}
      <MusicRequest
        isVisible={showMusicRequest}
        onClose={() => setShowMusicRequest(false)}
        onSendRequest={handleMusicRequest}
      />
    </div>
  );
};