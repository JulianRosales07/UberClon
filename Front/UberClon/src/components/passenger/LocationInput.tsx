import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationInputProps {
  placeholder: string;
  value?: Location;
  onChange: (location: Location) => void;
  icon?: React.ReactNode;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  placeholder,
  value,
  onChange,
  icon = <MapPin className="w-5 h-5 text-gray-400" />
}) => {
  const [inputValue, setInputValue] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Simular búsqueda de ubicaciones
    if (newValue.length > 2) {
      const mockSuggestions: Location[] = [
        { lat: 4.6097, lng: -74.0817, address: `${newValue} - Centro, Bogotá` },
        { lat: 4.6351, lng: -74.0703, address: `${newValue} - Zona Rosa, Bogotá` },
        { lat: 4.5981, lng: -74.0758, address: `${newValue} - Chapinero, Bogotá` },
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (location: Location) => {
    setInputValue(location.address || '');
    setShowSuggestions(false);
    onChange(location);
  };

  return (
    <div className="relative">
      <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3">
        {icon}
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className="flex-1 ml-3 bg-transparent outline-none text-gray-900 placeholder-gray-500"
        />
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-900">{suggestion.address}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};