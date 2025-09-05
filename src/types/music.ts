export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  type: 'youtube' | 'audio';
  url?: string; // For YouTube videos
  filePath?: string; // For uploaded audio files
  duration?: number; // Duration in seconds
  thumbnail?: string; // YouTube thumbnail or custom thumbnail
  createdAt: string;
  updatedAt: string;
}

export interface CreateMusicTrack {
  title: string;
  artist: string;
  type: 'youtube' | 'audio';
  url?: string;
  filePath?: string;
  duration?: number;
  thumbnail?: string;
}

export interface MusicPlaylist {
  id: string;
  name: string;
  description?: string;
  tracks: MusicTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMusicPlaylist {
  name: string;
  description?: string;
  trackIds: string[];
}

export interface MusicUploadResponse {
  track: MusicTrack;
  fileUrl: string;
}

export interface MusicSearchParams {
  query?: string;
  type?: 'youtube' | 'audio' | 'all';
  artist?: string;
  limit?: number;
  offset?: number;
}
