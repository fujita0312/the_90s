export interface MusicTrack {
  id: string;
  title: string;
  type: 'audio';
  url: string; // URL to the audio file
  filePath?: string; // Local file path
  duration?: number; // Duration in seconds
  createdAt: string;
  updatedAt: string;
}

export interface CreateMusicTrack {
  title: string;
  type: 'audio';
  url: string;
  filePath?: string;
  duration?: number;
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
