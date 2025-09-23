import React, { useState, useEffect } from 'react';
import { Car, Users, Zap, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
// Usar API directamente
import { useAppStore } from '../../store/useAppStore';

interface RideOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedTime: number;
  icon: React.ReactNode;
}

interface RideOptionsProps {
  onSelectRide: (option: RideOption) => void;
  distance?: number;
}

export const RideOptions: React.FC<RideOptionsProps> = ({ onSelectRide, distance: propDistance }) => {
  const { pickupLocation, destinationLocation } = useAppStore();
  const [distance, setDistance] = useState<number>(propDistance || 0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Calcular distancia real cuando se monta el componente
  useEffect(() => {
    if (pickupLocation && destinationLocation && !propDistance) {
      setIsCalculating(true);
      setCalculationError(null);
      
      // Usar API real para calcular distancia
      fetch(`${import.meta.env.VITE_API_URL}/locations-test/distance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: { lat: pickupLocation.lat, lon: pickupLocation.lng },
          to: { lat: destinationLocation.lat, lon: destinationLocation.lng }
        })
      })
        .then(response => response.json())
        .then((data) => {
          if (data.success) {
            setDistance(data.data.distance);
          } else {
            throw new Error('Error en respuesta de API');
          }
        })
        .catch((error) => {
          console.error('Error calculando distancia:', error);
          setCalculationError('Error calculando distancia');
          // Fallback a estimación básica
          setDistance(5);
        })
        .finally(() => {
          setIsCalculating(false);
        });
    }
  }, [pickupLocation, destinationLocation, propDistance]);

  const rideOptions: RideOption[] = [
    {
      id: 'uberx',
      name: 'UberX',
      description: 'Viajes asequibles para todos los días',
      price: Math.round(distance * 2500 + 3000),
      estimatedTime: Math.round(distance * 2 + 5),
      icon: <Car className="w-8 h-8" />
    },
    {
      id: 'comfort',
      name: 'Comfort',
      description: 'Vehículos más nuevos con más espacio',
      price: Math.round(distance * 3000 + 4000),
      estimatedTime: Math.round(distance * 2 + 3),
      icon: <Users className="w-8 h-8" />
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Vehículos de alta gama',
      price: Math.round(distance * 4500 + 6000),
      estimatedTime: Math.round(distance * 1.5 + 2),
      icon: <Zap className="w-8 h-8" />
    }
  ];

  if (isCalculating) {
    return (
      <div className="bg-white rounded-t-3xl p-6 shadow-lg">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-500">Calculando opciones de viaje...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-t-3xl shadow-lg max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Elige tu viaje</h3>
          <div className="text-sm text-gray-500">
            {distance > 0 && `${distance.toFixed(1)} km`}
            {calculationError && (
              <span className="text-red-500 text-xs">⚠️ Estimado</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
      
      <div className="space-y-3">
        {rideOptions.map((option) => (
          <div
            key={option.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
            onClick={() => onSelectRide(option)}
          >
            <div className="flex items-center space-x-4">
              <div className="text-gray-600">
                {option.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{option.name}</h4>
                <p className="text-sm text-gray-500">{option.description}</p>
                <p className="text-xs text-gray-400">{option.estimatedTime} min</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-lg">${option.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      
        <div className="mt-6">
          <Button 
            className="w-full"
            onClick={() => onSelectRide(rideOptions[0])}
            disabled={isCalculating}
          >
            Confirmar UberX
          </Button>
        </div>
      </div>
    </div>
  );
};