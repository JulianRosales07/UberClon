import React, { useState } from 'react';
import { ArrowLeft, Clock, MapPin, Star, Plus, UserCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

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
  const { user, logout } = useAppStore();
  const [pickupInput, setPickupInput] = useState(currentLocation?.address || 'Centro de Pasto, Nariño');
  const [destinationInput, setDestinationInput] = useState('');
  const [activeInput, setActiveInput] = useState<'pickup' | 'destination'>('destination');
  const [tripType, setTripType] = useState<'now' | 'later'>('now');
  const [forWho, setForWho] = useState<'me' | 'someone'>('me');

  const suggestions: LocationSuggestion[] = [
    {
      id: '1',
      name: 'Unicentro',
      address: 'Centro Comercial Unicentro',
      distance: '1.6 km',
      type: 'recent'
    },
    {
      id: '2',
      name: 'Avenida de los Estudiantes',
      address: 'Avenida de los Estudiantes',
      distance: '750 m',
      type: 'recent'
    },
    {
      id: '3',
      name: 'Universidad Mariana',
      address: 'Universidad Mariana',
      distance: '150 m',
      type: 'recent'
    },
    {
      id: '4',
      name: 'Único',
      address: 'Centro Comercial Único',
      distance: '4.1 km',
      type: 'recent'
    },
    {
      id: '5',
      name: 'Tamasagra',
      address: 'Tamasagra',
      distance: '3.1 km',
      type: 'recent'
    },
    {
      id: '6',
      name: 'Estadio Libertad',
      address: 'Estadio Libertad',
      distance: '4.2 km',
      type: 'recent'
    },
    {
      id: '7',
      name: 'Parque Infantil',
      address: 'Parque Infantil',
      distance: '750 m',
      type: 'recent'
    },
    {
      id: '8',
      name: 'Alvernia',
      address: 'Alvernia',
      distance: '2.4 km',
      type: 'recent'
    }
  ];

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    // Mapear las ubicaciones con sus coordenadas exactas
    const locationCoordinates: Record<string, { lat: number; lng: number }> = {
      'Unicentro': { lat: 1.216386, lng: -77.288671 },
      'Avenida de los Estudiantes': { lat: 1.226829, lng: -77.282465 },
      'Universidad Mariana': { lat: 1.223802, lng: -77.283742 },
      'Único': { lat: 1.205879, lng: -77.260628 },
      'Tamasagra': { lat: 1.204400, lng: -77.293005 },
      'Estadio Libertad': { lat: 1.198087, lng: -77.278660 },
      'Parque Infantil': { lat: 1.218915, lng: -77.281944 },
      'Alvernia': { lat: 1.220019, lng: -77.298537 }
    };

    const coords = locationCoordinates[suggestion.name] || { lat: 1.223789, lng: -77.283255 };
    
    const location: Location = {
      lat: coords.lat,
      lng: coords.lng,
      address: suggestion.address
    };

    if (activeInput === 'destination') {
      setDestinationInput(suggestion.name);
      // Simular selección automática cuando se elige destino
      const pickup: Location = {
        lat: 1.223789, // Centro de Pasto
        lng: -77.283255,
        address: pickupInput
      };
      onLocationSelect(pickup, location);
    } else {
      setPickupInput(suggestion.name);
      setActiveInput('destination');
    }
  };

  const handleDriverLogin = () => {
    logout(); // Cerrar sesión actual y volver a la página de inicio
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
        <button
          onClick={handleDriverLogin}
          className="bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors flex items-center space-x-1 text-sm font-medium"
          title="Iniciar sesión como conductor"
        >
          <UserCheck className="w-4 h-4" />
          <span>Conductor</span>
        </button>
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