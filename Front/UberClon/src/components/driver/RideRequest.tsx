import React from 'react';
import { X, Star, User } from 'lucide-react';

interface RideRequestData {
  id: string;
  fare: number;
  rating: number;
  pickupTime: number; // minutes
  pickupDistance: number; // miles/km
  pickupAddress: string;
  tripTime: number; // minutes
  tripDistance: number; // miles/km
  destinationAddress: string;
  serviceType: 'UberX' | 'UberPool' | 'UberBlack';
  isExclusive?: boolean;
}

interface RideRequestProps {
  request: RideRequestData;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

export const RideRequest: React.FC<RideRequestProps> = ({
  request,
  onAccept,
  onDecline
}) => {
  return (
    <div className="bg-white mx-4 mb-4 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="bg-black text-white px-3 py-1 rounded-full flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{request.serviceType}</span>
          </div>
          {request.isExclusive && (
            <span className="text-blue-600 text-sm font-medium">Exclusive</span>
          )}
        </div>
        <button 
          onClick={() => onDecline(request.id)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Fare */}
      <div className="px-4 pt-4">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          ${request.fare.toFixed(2)}
        </div>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-4">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-gray-700 font-medium">{request.rating}</span>
        </div>
      </div>

      {/* Trip Details */}
      <div className="px-4 pb-4">
        {/* Pickup */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-3 h-3 bg-black rounded-full mt-2 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">
              {request.pickupTime} mins ({request.pickupDistance} mi) away
            </div>
            <div className="text-gray-900 font-medium">
              {request.pickupAddress}
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-start space-x-3 mb-6">
          <div className="w-3 h-3 border-2 border-black mt-2 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">
              {request.tripTime} mins ({request.tripDistance} mi) trip
            </div>
            <div className="text-gray-900 font-medium">
              {request.destinationAddress}
            </div>
          </div>
        </div>

        {/* Accept Button */}
        <button
          onClick={() => onAccept(request.id)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
};