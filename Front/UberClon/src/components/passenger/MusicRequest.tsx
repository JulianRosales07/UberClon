import React, { useState } from 'react';
import { Music, Send, X, Volume2, Heart, Headphones } from 'lucide-react';
import { Button } from '../common/Button';
import type { MusicSuggestion } from '../../types/music';

interface MusicRequestProps {
  onSendRequest: (song: string, artist?: string, message?: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

export const MusicRequest: React.FC<MusicRequestProps> = ({
  onSendRequest,
  onClose,
  isVisible
}) => {
  const [songInput, setSongInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<MusicSuggestion | null>(null);

  const musicSuggestions: MusicSuggestion[] = [
    { id: '1', song: 'Despacito', artist: 'Luis Fonsi', genre: 'Reggaeton', emoji: '🎵' },
    { id: '2', song: 'Shape of You', artist: 'Ed Sheeran', genre: 'Pop', emoji: '🎶' },
    { id: '3', song: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', emoji: '✨' },
    { id: '4', song: 'Levitating', artist: 'Dua Lipa', genre: 'Pop', emoji: '💫' },
    { id: '5', song: 'Bad Bunny - Tití Me Preguntó', artist: 'Bad Bunny', genre: 'Reggaeton', emoji: '🐰' },
    { id: '6', song: 'As It Was', artist: 'Harry Styles', genre: 'Pop', emoji: '🌟' },
    { id: '7', song: 'Heat Waves', artist: 'Glass Animals', genre: 'Indie', emoji: '🌊' },
    { id: '8', song: 'Stay', artist: 'The Kid LAROI & Justin Bieber', genre: 'Pop', emoji: '💎' }
  ];

  const handleSendRequest = () => {
    let finalSong = songInput;
    let finalArtist = artistInput;
    let finalMessage = messageInput;

    if (selectedSuggestion) {
      finalSong = selectedSuggestion.song;
      finalArtist = selectedSuggestion.artist;
    }

    if (!finalSong.trim()) {
      return;
    }

    onSendRequest(finalSong, finalArtist, finalMessage);
    
    // Limpiar formulario
    setSongInput('');
    setArtistInput('');
    setMessageInput('');
    setSelectedSuggestion(null);
    onClose();
  };

  const handleSuggestionClick = (suggestion: MusicSuggestion) => {
    setSelectedSuggestion(suggestion);
    setSongInput(suggestion.song);
    setArtistInput(suggestion.artist);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Music className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Solicitar Música</h3>
              <p className="text-sm text-gray-500">Pide una canción al conductor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sugerencias Populares */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Volume2 className="w-4 h-4 text-gray-600" />
              <h4 className="font-semibold text-gray-900">Canciones Populares</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {musicSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border text-left transition-colors ${
                    selectedSuggestion?.id === suggestion.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{suggestion.emoji}</span>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{suggestion.song}</h5>
                    <p className="text-sm text-gray-500">{suggestion.artist} • {suggestion.genre}</p>
                  </div>
                  {selectedSuggestion?.id === suggestion.id && (
                    <Heart className="w-4 h-4 text-purple-600 fill-current" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Formulario Personalizado */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Headphones className="w-4 h-4 text-gray-600" />
              <h4 className="font-semibold text-gray-900">Solicitud Personalizada</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canción *
                </label>
                <input
                  type="text"
                  value={songInput}
                  onChange={(e) => setSongInput(e.target.value)}
                  placeholder="Nombre de la canción"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artista
                </label>
                <input
                  type="text"
                  value={artistInput}
                  onChange={(e) => setArtistInput(e.target.value)}
                  placeholder="Nombre del artista"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ej: ¡Esta canción me encanta! ¿Podrías ponerla?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={!songInput.trim() && !selectedSuggestion}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Solicitud</span>
            </Button>
          </div>

          {/* Nota */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> El conductor puede aceptar o declinar tu solicitud. 
              Sé amable y considera que algunos conductores prefieren su propia música.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};