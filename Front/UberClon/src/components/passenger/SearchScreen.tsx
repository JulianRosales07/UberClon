import React, { useState } from 'react';
import { ArrowLeft, Clock, MapPin, Star, Plus } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface SearchScreenProps {
  onBack: () => void;
  onLocationSelect: (pickup: Location, destination: Location) => void;
  currentLocation?: Location;
}

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  distance: string;
  type: 'recent' | 'saved' | 'search';
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onBack,
  onLocationSelect,
  currentLocation
}) => {
  const [pickupInput, setPickupInput] = useState(currentLocation?.address || 'Cra 22d #717');
  const [destinationInput, setDestinationInput] = useState('');
  const [activeInput, setActiveInput] = useState<'pickup' | 'destination'>('destination');
  const [tripType, setTripType] = useState<'now' | 'later'>('now');
  const [forWho, setForWho] = useState<'me' | 'someone'>('me');

  const suggestions: LocationSuggestion[] = [
    {
      id: '1',
      name: 'Genoy',
      address: 'Pasto, Nariño',
      distance: '7.4 mi',
      type: 'recent'
    },
    {
      id: '2',
      name: 'Terminal De Transporte de Pasto',
      address: 'Pasto, Nariño',
      distance: '1.9 mi',
      type: 'recent'
    },
    {
      id: '3',
      name: 'Universidad Mariana',
      address: 'Cl 18 #34 - 104, Pasto, Nariño',
      distance: '1.7 mi',
      type: 'recent'
    },
    {
      id: '4',
      name: 'Centro Comercial Unicentro Pasto',
      address: 'Calle 11 No. 34 - 78, Av. Panamericana, La Aurora, San Juan de Pasto, Nariño',
      distance: '1.0 mi',
      type: 'recent'
    },
    {
      id: '5',
      name: 'Aeropuerto Antonio Nariño',
      address: 'Aeropuerto, Antonio Nariño, Chachagüí, Nariño',
      distance: '17 mi',
      type: 'recent'
    }
  ];

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const location: Location = {
      lat: 4.6097 + Math.random() * 0.1,
      lng: -74.0817 + Math.random() * 0.1,
      address: suggestion.name
    };

    if (activeInput === 'destination') {
      setDestinationInput(suggestion.name);
      // Simular selección automática cuando se elige destino
      const pickup: Location = {
        lat: 4.6097,
        lng: -74.0817,
        address: pickupInput
      };
      onLocationSelect(pickup, location);
    } else {
      setPickupInput(suggestion.name);
      setActiveInput('destination');
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold">Planifica tu viaje</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Trip Options */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex space-x-4">
          <button
            onClick={() => setTripType('now')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
              tripType === 'now'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Iniciar viaje</span>
          </button>
          
          <button
            onClick={() => setForWho('me')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
              forWho === 'me'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300'
            }`}
          >
            <span>👤</span>
            <span>Para mí</span>
          </button>
        </div>
      </div>

      {/* Location Inputs */}
      <div className="px-4 py-4">
        <div className="relative border-2 border-black rounded-lg">
          {/* Pickup Input */}
          <div className="flex items-center p-4 border-b border-gray-200">
            <div className="w-3 h-3 bg-black rounded-full mr-4"></div>
            <input
              type="text"
              value={pickupInput}
              onChange={(e) => setPickupInput(e.target.value)}
              onFocus={() => setActiveInput('pickup')}
              className="flex-1 text-base outline-none"
              placeholder="Punto de recogida"
            />
          </div>
          
          {/* Destination Input */}
          <div className="flex items-center p-4">
            <div className="w-3 h-3 border-2 border-black rounded-sm mr-4"></div>
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              onFocus={() => setActiveInput('destination')}
              className="flex-1 text-base outline-none text-blue-500"
              placeholder="¿A dónde vas?"
            />
          </div>
          
          {/* Plus Button */}
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 px-4">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => handleSuggestionClick(suggestion)}
            className="w-full flex items-center space-x-4 py-4 border-b border-gray-100 text-left hover:bg-gray-50"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{suggestion.name}</h3>
              <p className="text-sm text-gray-500">{suggestion.address}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">{suggestion.distance}</p>
            </div>
          </button>
        ))}

        {/* Additional Options */}
        <button className="w-full flex items-center space-x-4 py-4 border-b border-gray-100 text-left hover:bg-gray-50">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Buscar en otra ciudad</h3>
          </div>
        </button>

        <button className="w-full flex items-center space-x-4 py-4 border-b border-gray-100 text-left hover:bg-gray-50">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Establece la ubicación en el mapa</h3>
          </div>
        </button>

        <div className="py-4">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Ubicaciones guardadas</h3>
          </div>
        </div>
      </div>
    </div>
  );
};