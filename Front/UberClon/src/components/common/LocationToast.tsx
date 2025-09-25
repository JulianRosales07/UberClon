import React, { useEffect, useState } from 'react';
import { MapPin, CheckCircle, X } from 'lucide-react';

interface LocationToastProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export const LocationToast: React.FC<LocationToastProps> = ({
  message,
  type,
  show,
  onClose,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info':
        return <MapPin className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <MapPin className="w-5 h-5 text-orange-600" />;
      case 'error':
        return <MapPin className="w-5 h-5 text-red-600" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'info':
        return 'text-blue-800';
      case 'warning':
        return 'text-orange-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${getBackgroundColor()}`}>
        {getIcon()}
        <span className={`text-sm font-medium ${getTextColor()}`}>
          {message}
        </span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`ml-2 hover:opacity-70 transition-opacity ${getTextColor()}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};