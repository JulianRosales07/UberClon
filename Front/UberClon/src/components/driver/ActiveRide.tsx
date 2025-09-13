import React, { useState, useEffect } from 'react';
import { DriverMap } from './DriverMap';
import { ArrowUp, Navigation, Menu, User } from 'lucide-react';

interface ActiveRideData {
  id: string;
  passengerName: string;
  pickupAddress: string;
  destinationAddress: string;
  estimatedTime: number; // minutes
  distance: number; // miles/km
  currentInstruction: {
    direction: string;
    distance: string;
    street: string;
  };
  status: 'going_to_pickup' | 'picking_up' | 'in_transit' | 'arriving';
}

interface ActiveRideProps {
  rideData: ActiveRideData;
  onCompleteRide: () => void;
  onCancelRide: () => void;
}

export const ActiveRide: React.FC<ActiveRideProps> = ({
  rideData,
  onCompleteRide,
  onCancelRide
}) => {
  const [timeRemaining, setTimeRemaining] = useState(rideData.estimatedTime);
  const [currentDistance, setCurrentDistance] = useState(rideData.distance);

  // Simulate countdown and distance updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 0.1));
      setCurrentDistance(prev => Math.max(0, prev - 0.01));
    }, 6000); // Update every 6 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusText = () => {
    switch (rideData.status) {
      case 'going_to_pickup':
        return `Recogiendo a ${rideData.passengerName}`;
      case 'picking_up':
        return 'Pasajero abordando';
      case 'in_transit':
        return `En viaje con ${rideData.passengerName}`;
      case 'arriving':
        return 'Llegando al destino';
      default:
        return 'En viaje';
    }
  };

  return (
    <div className="h-screen w-full relative">
      {/* Map Background */}
      <div className="absolute inset-0">
        <DriverMap
          center={{ lat: 1.2136, lng: -77.2811 }}
          driverLocation={{ lat: 1.2136, lng: -77.2811 }}
        />
      </div>

      {/* Navigation Instructions Header */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="bg-black text-white mx-4 mt-4 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-4 mb-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <ArrowUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-xl font-bold">{rideData.currentInstruction.direction}</div>
              <div className="text-base opacity-90">
                {rideData.currentInstruction.distance} toward {rideData.currentInstruction.street}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-600 pt-3">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-white rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-semibold text-base">
                  {rideData.status === 'going_to_pickup' ? 'Pickup on' : 'Destino en'} {rideData.pickupAddress.split(',')[0]}
                </div>
                <div className="text-sm opacity-80 mt-1">
                  {rideData.status === 'going_to_pickup' 
                    ? `Near ${rideData.pickupAddress}`
                    : `Near ${rideData.destinationAddress}`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Controls */}
      <div className="absolute right-4 bottom-40 z-40 space-y-3">
        <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
          <div className="w-6 h-6 bg-gray-800 rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </button>
        <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
          <ArrowUp className="w-6 h-6 text-gray-700" />
        </button>
        <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
          <ArrowUp className="w-6 h-6 text-gray-700 transform rotate-180" />
        </button>
      </div>

      {/* Navigate Button */}
      <div className="absolute bottom-24 right-4 z-40">
        <button className="bg-black text-white px-8 py-4 rounded-full flex items-center space-x-3 shadow-xl hover:bg-gray-800 transition-colors">
          <div className="bg-white text-black p-1 rounded-full">
            <Navigation className="w-4 h-4" />
          </div>
          <span className="font-semibold text-lg">Navigate</span>
        </button>
      </div>

      {/* Bottom Status Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Menu className="w-6 h-6 text-gray-600" />
            
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {Math.ceil(timeRemaining)} min
              </div>
              <div className="flex items-center justify-center space-x-2 text-base text-gray-600">
                <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="font-medium">{currentDistance.toFixed(1)} mi</span>
              </div>
              <div className="text-gray-700 font-medium mt-1">
                {getStatusText()}
              </div>
            </div>
            
            <Menu className="w-6 h-6 text-gray-600" />
          </div>
          
          {/* Action Buttons - Only show when needed */}
          {(rideData.status === 'going_to_pickup' || rideData.status === 'picking_up' || rideData.status === 'in_transit') && (
            <div className="flex space-x-3 mt-4">
              {rideData.status === 'going_to_pickup' && (
                <button 
                  onClick={() => {/* Update status to picking_up */}}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Llegué al pickup
                </button>
              )}
              
              {rideData.status === 'picking_up' && (
                <button 
                  onClick={() => {/* Update status to in_transit */}}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Iniciar viaje
                </button>
              )}
              
              {rideData.status === 'in_transit' && (
                <button 
                  onClick={onCompleteRide}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Completar viaje
                </button>
              )}
              
              <button 
                onClick={onCancelRide}
                className="px-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};