import React, { useEffect, useState } from 'react';
import { Music, Check, X, Volume2 } from 'lucide-react';

interface MusicNotificationProps {
  type: 'accepted' | 'declined' | 'playing';
  song: string;
  artist?: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const MusicNotification: React.FC<MusicNotificationProps> = ({
  type,
  song,
  artist,
  onClose,
  autoClose = true,
  duration = 4000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'accepted':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'declined':
        return <X className="w-5 h-5 text-red-600" />;
      case 'playing':
        return <Volume2 className="w-5 h-5 text-purple-600" />;
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'accepted':
        return 'El conductor aceptó tu solicitud';
      case 'declined':
        return 'El conductor declinó tu solicitud';
      case 'playing':
        return '¡Tu canción está sonando!';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'accepted':
        return 'bg-green-50 border-green-200';
      case 'declined':
        return 'bg-red-50 border-red-200';
      case 'playing':
        return 'bg-purple-50 border-purple-200';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`rounded-lg border p-4 shadow-lg max-w-sm ${getBackgroundColor()}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Music className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                {getMessage()}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {song}
              {artist && ` - ${artist}`}
            </p>
            {type === 'playing' && (
              <div className="flex items-center space-x-1 mt-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <span className="text-xs text-purple-700 ml-2">Reproduciendo</span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};