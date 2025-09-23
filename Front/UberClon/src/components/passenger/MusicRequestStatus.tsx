import React from 'react';
import { Music, Check, Clock, X, Volume2 } from 'lucide-react';
import type { MusicRequestData } from '../../types/music';

interface MusicRequestStatusProps {
  requests: MusicRequestData[];
  onRetry?: (requestId: string) => void;
}

export const MusicRequestStatus: React.FC<MusicRequestStatusProps> = ({
  requests,
  onRetry
}) => {
  if (requests.length === 0) return null;

  const getStatusIcon = (status: MusicRequestData['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'accepted':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'declined':
        return <X className="w-4 h-4 text-red-600" />;
      case 'playing':
        return <Volume2 className="w-4 h-4 text-purple-600" />;
    }
  };

  const getStatusText = (status: MusicRequestData['status']) => {
    switch (status) {
      case 'pending':
        return 'Esperando respuesta';
      case 'accepted':
        return 'Aceptada por el conductor';
      case 'declined':
        return 'Declinada por el conductor';
      case 'playing':
        return '¡Sonando ahora!';
    }
  };

  const getStatusColor = (status: MusicRequestData['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'accepted':
        return 'bg-green-50 border-green-200';
      case 'declined':
        return 'bg-red-50 border-red-200';
      case 'playing':
        return 'bg-purple-50 border-purple-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <Music className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Solicitudes de Música</h3>
      </div>

      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className={`rounded-lg border p-3 ${getStatusColor(request.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {getStatusIcon(request.status)}
                  <span className="text-sm font-medium text-gray-700">
                    {getStatusText(request.status)}
                  </span>
                </div>
                
                <h4 className="font-semibold text-gray-900">{request.song}</h4>
                {request.artist && (
                  <p className="text-sm text-gray-600">por {request.artist}</p>
                )}
                
                {request.message && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    "{request.message}"
                  </p>
                )}
                
                <p className="text-xs text-gray-400 mt-2">
                  {request.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {request.status === 'playing' && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </div>

            {request.status === 'declined' && onRetry && (
              <button
                onClick={() => onRetry(request.id)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Intentar con otra canción
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};