import React, { useState, useEffect } from 'react';
import './DriverSearchIndicator.css';

interface DriverSearchIndicatorProps {
  isSearching: boolean;
  onCancel?: () => void;
  driversFound?: number;
  searchMessage?: string;
}

export const DriverSearchIndicator: React.FC<DriverSearchIndicatorProps> = ({
  isSearching,
  onCancel,
  driversFound = 0,
  searchMessage = 'Buscando conductor disponible...'
}) => {
  const [dots, setDots] = useState('');
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    if (!isSearching) {
      setDots('');
      setSearchTime(0);
      return;
    }

    // Animación de puntos
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    // Contador de tiempo
    const timeInterval = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timeInterval);
    };
  }, [isSearching]);

  if (!isSearching) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="driver-search-overlay">
      <div className="driver-search-modal">
        <div className="search-animation">
          <div className="search-circle">
            <div className="search-pulse"></div>
            <div className="search-pulse delay-1"></div>
            <div className="search-pulse delay-2"></div>
            <div className="search-icon">🚗</div>
          </div>
        </div>

        <div className="search-content">
          <h3 className="search-title">
            {searchMessage}{dots}
          </h3>
          
          <div className="search-info">
            <div className="info-item">
              <span className="info-icon">⏱️</span>
              <span className="info-text">Tiempo de búsqueda: {formatTime(searchTime)}</span>
            </div>
            
            {driversFound > 0 && (
              <div className="info-item">
                <span className="info-icon">👥</span>
                <span className="info-text">{driversFound} conductores encontrados</span>
              </div>
            )}
          </div>

          <div className="search-tips">
            <p>💡 Estamos contactando a los conductores más cercanos</p>
            <p>⚡ Normalmente encontramos un conductor en menos de 2 minutos</p>
          </div>

          {onCancel && (
            <button 
              onClick={onCancel}
              className="cancel-search-btn"
            >
              Cancelar búsqueda
            </button>
          )}
        </div>

        <div className="search-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
};