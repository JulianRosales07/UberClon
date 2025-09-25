import React from 'react';
import { MapPin, Navigation, CheckCircle, AlertCircle } from 'lucide-react';

interface LocationStatusProps {
  status: 'loading' | 'success' | 'error' | 'denied';
  location?: {
    lat: number;
    lng: number;
    address?: string;
  } | null;
  accuracy?: number | null;
  error?: string | null;
  onRetry?: () => void;
  onUsePasto?: () => void;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({
  status,
  location,
  accuracy,
  error,
  onRetry,
  onUsePasto
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Navigation className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'denied':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Obteniendo ubicación...';
      case 'success':
        return location?.address || 'Ubicación obtenida';
      case 'error':
        return 'Ubicación aproximada';
      case 'denied':
        return 'GPS denegado';
      default:
        return 'Sin ubicación';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-orange-600';
      case 'denied':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {getStatusIcon()}
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {location && accuracy && (
          <span className="text-xs text-gray-500">
            Precisión: ±{Math.round(accuracy)}m
          </span>
        )}
        {error && status !== 'success' && (
          <span className="text-xs text-red-500">
            {error}
          </span>
        )}
      </div>
      
      {/* Botones de acción */}
      {(status === 'error' || status === 'denied') && (
        <div className="flex space-x-1 ml-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              🔄
            </button>
          )}
          {onUsePasto && (
            <button
              onClick={onUsePasto}
              className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
            >
              🏛️
            </button>
          )}
        </div>
      )}
    </div>
  );
};