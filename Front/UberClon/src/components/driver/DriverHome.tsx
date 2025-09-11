import React, { useState } from 'react';
import { Map } from '../common/Map';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';
import { Power, Navigation, DollarSign, Clock } from 'lucide-react';

export const DriverHome: React.FC = () => {
  const { currentLocation, user } = useAppStore();
  const [isOnline, setIsOnline] = useState(false);
  const [earnings, setEarnings] = useState(125000);
  const [tripsToday, setTripsToday] = useState(8);
  const [hoursOnline, setHoursOnline] = useState(6.5);

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Hola, {user?.name || 'Conductor'}</h2>
            <p className="text-gray-600">
              {isOnline ? 'Estás en línea' : 'Estás desconectado'}
            </p>
          </div>
          <Button
            onClick={toggleOnlineStatus}
            variant={isOnline ? 'danger' : 'primary'}
            className="flex items-center space-x-2"
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'Desconectar' : 'Conectar'}</span>
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <Map
          center={currentLocation || { lat: 4.6097, lng: -74.0817 }}
        />
      </div>

      {/* Stats Panel */}
      <div className="bg-white p-6">
        <h3 className="text-lg font-bold mb-4">Resumen de hoy</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold">${earnings.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Ganancias</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{tripsToday}</p>
            <p className="text-sm text-gray-600">Viajes</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{hoursOnline}h</p>
            <p className="text-sm text-gray-600">En línea</p>
          </div>
        </div>

        {!isOnline && (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-600 mb-3">
              Conéctate para empezar a recibir solicitudes de viaje
            </p>
            <Button onClick={toggleOnlineStatus} className="w-full">
              Conectarse
            </Button>
          </div>
        )}

        {isOnline && (
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
            </div>
            <p className="text-green-700 font-semibold">
              Buscando pasajeros cercanos...
            </p>
            <p className="text-green-600 text-sm">
              Mantente en una zona con alta demanda
            </p>
          </div>
        )}
      </div>
    </div>
  );
};