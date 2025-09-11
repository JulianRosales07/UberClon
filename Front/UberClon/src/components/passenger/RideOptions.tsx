import React from 'react';
import { Car, Users, Zap } from 'lucide-react';
import { Button } from '../common/Button';

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
  distance: number;
}

export const RideOptions: React.FC<RideOptionsProps> = ({ onSelectRide, distance }) => {
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

  return (
    <div className="bg-white rounded-t-3xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">Elige tu viaje</h3>
      
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
        >
          Confirmar UberX
        </Button>
      </div>
    </div>
  );
};