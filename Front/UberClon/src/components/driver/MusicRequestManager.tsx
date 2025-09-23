import React, { useState } from 'react';
import { Music, Check, X, Play, Pause, Volume2, User } from 'lucide-react';
import { Button } from '../common/Button';

interface MusicRequest {
  id: string;
  song: string;
  artist?: string;
  message?: string;
  passengerName: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined' | 'playing';
}

interface MusicRequestManagerProps {
  requests: MusicRequest[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onPlayRequest: (requestId: string) => void;
  onStopRequest: (requestId: string) => void;
}

export const MusicRequestManager: React.FC<MusicRequestManagerProps> = ({
  requests,
  onAcceptRequest,
  onDeclineRequest,
  onPlayRequest,
  onStopRequest
}) => {
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const acceptedRequests = requests.filter(req => req.status === 'accepted');
  const playingRequest = requests.find(req => req.status === 'playing');

  if (requests.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Solicitudes de Música</h3>
        </div>
        <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
          {pendingRequests.length} pendientes
        </div>
      </div>

      {/* Canción Actual */}
      {playingRequest && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">🎵 Sonando ahora</h4>
                <p className="text-sm text-gray-600">
                  {playingRequest.song}
                  {playingRequest.artist && ` - ${playingRequest.artist}`}
                </p>
                <p className="text-xs text-gray-500">
                  Solicitada por {playingRequest.passengerName}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onStopRequest(playingRequest.id)}
            >
              <Pause className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Solicitudes Pendientes */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 text-sm">Nuevas Solicitudes</h4>
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {request.passengerName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {request.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <h5 className="font-semibold text-gray-900 mb-1">
                    {request.song}
                  </h5>
                  
                  {request.artist && (
                    <p className="text-sm text-gray-600 mb-2">
                      por {request.artist}
                    </p>
                  )}
                  
                  {request.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 italic">
                        "{request.message}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => onAcceptRequest(request.id)}
                  className="flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Aceptar</span>
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onPlayRequest(request.id)}
                  className="flex items-center space-x-1"
                >
                  <Play className="w-4 h-4" />
                  <span>Reproducir</span>
                </Button>
                
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDeclineRequest(request.id)}
                  className="flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Declinar</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Solicitudes Aceptadas */}
      {acceptedRequests.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-700 text-sm">Cola de Reproducción</h4>
          {acceptedRequests.map((request, index) => (
            <div
              key={request.id}
              className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-700">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {request.song}
                    {request.artist && ` - ${request.artist}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.passengerName}
                  </p>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onPlayRequest(request.id)}
                className="flex items-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span className="text-xs">Reproducir</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Consejos para el conductor */}
      <div className="mt-4 bg-blue-50 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          💡 <strong>Consejos:</strong> Puedes aceptar solicitudes para más tarde o reproducir inmediatamente. 
          Los pasajeros aprecian cuando respondes a sus solicitudes.
        </p>
      </div>
    </div>
  );
};