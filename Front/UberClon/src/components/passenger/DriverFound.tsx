import React, { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { Star, User, Phone, MessageCircle, Car } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicleInfo: {
    make: string;
    model: string;
    color: string;
    licensePlate: string;
  };
  totalTrips: number;
}

interface DriverFoundProps {
  driver: Driver;
  estimatedArrival: number;
  onCancel: () => void;
}

export const DriverFound: React.FC<DriverFoundProps> = ({
  driver,
  estimatedArrival,
  onCancel
}) => {
  const [timeLeft, setTimeLeft] = useState(estimatedArrival);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white p-4 rounded-t-3xl shadow-lg">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
          <Car className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-green-600 mb-1">¡Conductor encontrado!</h3>
        <p className="text-sm text-gray-600">Tu conductor está en camino</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold">{driver.name}</h4>
            <div className="flex items-center space-x-2 mb-1">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs font-medium">{driver.rating}</span>
              </div>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{driver.totalTrips.toLocaleString()} viajes</span>
            </div>
            <p className="text-xs text-gray-600">
              {driver.vehicleInfo.make} {driver.vehicleInfo.model} {driver.vehicleInfo.color}
            </p>
            <p className="text-xs font-medium text-gray-800">{driver.vehicleInfo.licensePlate}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mb-4 text-center">
        <p className="text-blue-800 font-semibold text-sm">
          Llegará en {timeLeft} minutos
        </p>
        <p className="text-blue-600 text-xs">
          Te notificaremos cuando esté cerca
        </p>
      </div>

      <div className="flex space-x-2 mb-3">
        <Button className="flex-1 flex items-center justify-center space-x-2 py-2">
          <Phone className="w-4 h-4" />
          <span className="text-sm">Llamar</span>
        </Button>
        <Button variant="secondary" className="flex-1 flex items-center justify-center space-x-2 py-2">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">Mensaje</span>
        </Button>
      </div>

      <Button 
        variant="danger" 
        className="w-full py-2"
        onClick={onCancel}
      >
        <span className="text-sm">Cancelar viaje</span>
      </Button>

      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Cancelación gratuita hasta que llegue tu conductor
        </p>
      </div>
    </div>
  );
};