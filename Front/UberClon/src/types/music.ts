export interface MusicRequestData {
  id: string;
  song: string;
  artist?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'playing';
  timestamp: Date;
}

export interface MusicSuggestion {
  id: string;
  song: string;
  artist: string;
  genre: string;
  emoji: string;
}

export interface MusicNotificationData {
  type: 'accepted' | 'declined' | 'playing';
  song: string;
  artist?: string;
}