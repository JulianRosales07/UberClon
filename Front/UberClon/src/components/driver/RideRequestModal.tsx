import React, { useState, useEffect } from 'react';
import './RideRequestModal.css';

interface RideRequest {
  rideId: string;
  passenger: {
    name: string;
    id: string;
  };
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  estimatedFare: number;
  distance?: string;
}

interface RideRequestModalProps {
  request: RideRequest;
  onAccept: () => void;
  onReject: (reason?: string) => void;
  driverId: string;
}

export const RideRequestModal: React.FC<RideRequestModalProps> = ({
  request,
  onAccept,
  onReject,
  driverId
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-rechazar cuando se acaba el tiempo
          onReject('Tiempo agotado');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReject]);

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  const handleReject = () => {
    setIsVisible(false);
    onReject('Rechazado manualmente');
  };

  if (!isVisible) return null;

  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <div className="ride-request-overlay">
      <div className="ride-request-modal">
        <div className="modal-header">
          <h2>🚕 Nueva Solicitud de Viaje</h2>
          <div className="timer-container">
            <div className="timer-circle">
              <div 
                className="timer-progress" 
                style={{ 
                  background: `conic-gradient(#4CAF50 ${progressPercentage * 3.6}deg, #e0e0e0 0deg)` 
                }}
              >
                <div className="timer-inner">
                  <span className="timer-text">{timeLeft}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ride-details">
          <div className="passenger-info">
            <div className="info-row">
              <span className="icon">👤</span>
              <span className="label">Pasajero:</span>
              <span className="value">{request.passenger.name}</span>
            </div>
          </div>

          <div className="location-info">
            <div className="info-row pickup">
              <span className="icon">📍</span>
              <span className="label">Origen:</span>
              <span className="value">{request.pickup.address}</span>
            </div>
            
            <div className="route-line"></div>
            
            <div className="info-row destination">
              <span className="icon">🎯</span>
              <span className="label">Destino:</span>
              <span className="value">{request.destination.address}</span>
            </div>
          </div>

          <div className="trip-info">
            <div className="info-row">
              <span className="icon">💰</span>
              <span className="label">Tarifa estimada:</span>
              <span className="value fare">${request.estimatedFare.toFixed(2)}</span>
            </div>
            
            {request.distance && (
              <div className="info-row">
                <span className="icon">📏</span>
                <span className="label">Distancia:</span>
                <span className="value">{request.distance} km</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button 
            onClick={handleReject} 
            className="reject-btn"
            disabled={timeLeft <= 0}
          >
            ❌ Rechazar
          </button>
          <button 
            onClick={handleAccept} 
            className="accept-btn"
            disabled={timeLeft <= 0}
          >
            ✅ Aceptar Viaje
          </button>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};