import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DriverMap } from './DriverMap';
import { RideRequests } from './RideRequests';
import { ActiveRide } from './ActiveRide';
import { Menu, Search, BarChart3, Navigation, AlertTriangle, ChevronRight, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './DriverHome.css';

interface ActiveRideData {
  id: string;
  passengerName: string;
  pickupAddress: string;
  destinationAddress: string;
  estimatedTime: number;
  distance: number;
  currentInstruction: {
    direction: string;
    distance: string;
    street: string;
  };
  status: 'going_to_pickup' | 'picking_up' | 'in_transit' | 'arriving';
}

export const DriverHome: React.FC = () => {
  const { currentLocation, logout } = useAppStore();
  const [isOnline, setIsOnline] = useState(false);
  const [earnings, setEarnings] = useState(0.00);
  const [activeRide, setActiveRide] = useState<ActiveRideData | null>(null);

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const handleAcceptRide = (requestId: string) => {
    // Create active ride data
    const rideData: ActiveRideData = {
      id: requestId,
      passengerName: 'Melody',
      pickupAddress: 'Cra 22d #717, Genoy, Pasto',
      destinationAddress: 'Centro Comercial Unicentro, Pasto',
      estimatedTime: 4,
      distance: 1.2,
      currentInstruction: {
        direction: 'Head west',
        distance: '150 ft',
        street: 'Calle 18'
      },
      status: 'going_to_pickup'
    };

    setActiveRide(rideData);
    // Simulate earning money from accepted ride
    setEarnings(prev => prev + Math.random() * 15 + 5);
  };

  const handleCompleteRide = () => {
    setActiveRide(null);
    // Add completion bonus
    setEarnings(prev => prev + 2);
  };

  const handleCancelRide = () => {
    setActiveRide(null);
  };

  // If there's an active ride, show the navigation interface
  if (activeRide) {
    return (
      <ActiveRide
        rideData={activeRide}
        onCompleteRide={handleCompleteRide}
        onCancelRide={handleCancelRide}
      />
    );
  }

  return (
    <div className="h-screen w-full relative">
      {/* Real Map Background */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <DriverMap
          center={currentLocation || { lat: 1.2136, lng: -77.2811 }} // Pasto coordinates
          driverLocation={currentLocation || { lat: 1.2136, lng: -77.2811 }}
        />
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4" style={{ zIndex: 1000 }}>
        <button 
          onClick={logout}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        {/* Earnings Display */}
        <div className="bg-black rounded-full px-6 py-3 flex items-center space-x-2 shadow-lg">
          <span className="text-green-400 text-sm font-medium">COP</span>
          <span className="text-white text-lg font-bold">{earnings.toFixed(2)}</span>
        </div>

        <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
          <Search className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Driver Location Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 900 }}>
        <div className="w-12 h-12 bg-white rounded-full border-4 border-black flex items-center justify-center shadow-lg">
          <Navigation className="w-6 h-6 text-black" />
        </div>
      </div>

      {/* Start Button */}
      <div className="absolute bottom-80 left-1/2 transform -translate-x-1/2" style={{ zIndex: 900 }}>
        <button
          onClick={toggleOnlineStatus}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl transition-all duration-200 ${
            isOnline 
              ? 'bg-red-500 hover:bg-red-600 hover:scale-105' 
              : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
          }`}
        >
          {isOnline ? 'PARAR' : 'INICIAR'}
        </button>
      </div>

      {/* Side Controls */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-4" style={{ zIndex: 900 }}>
        <button className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
          <BarChart3 className="w-6 h-6 text-gray-700" />
        </button>
        <button className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
          <Navigation className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Bottom Panel - Account Attention (when offline) */}
      {!isOnline && (
        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 800 }}>
          <div className="bg-white mx-4 mb-4 rounded-lg shadow-xl border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Menu className="w-6 h-6 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">La cuenta requiere atención</h3>
              </div>
              <Menu className="w-6 h-6 text-gray-400" />
            </div>

            {/* Required Actions */}
            <div className="p-4">
              <div className="flex items-start space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Acciones requeridas (1)</h4>
                  <p className="text-red-500 text-sm">Conéctate cuando se resuelva</p>
                </div>
              </div>

              {/* Property Card Attention */}
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-left">
                  <h5 className="font-semibold text-gray-900">Tu Tarjeta de Propiedad requiere atención</h5>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Driving Time */}
              <button className="w-full flex items-center space-x-3 p-4 mt-4 hover:bg-gray-50 rounded-lg transition-colors">
                <Clock className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700 font-medium">Ver tiempo de conducción</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ride Requests (when online) */}
      <RideRequests 
        isOnline={isOnline}
        onAcceptRide={handleAcceptRide}
      />

      {/* Status Indicator */}
      {isOnline && (
        <div className="absolute top-20 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg" style={{ zIndex: 1000 }}>
          En línea
        </div>
      )}
    </div>
  );
};