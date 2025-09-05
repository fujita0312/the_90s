import { MusicTrack, CreateMusicTrack, MusicPlaylist, CreateMusicPlaylist, MusicUploadResponse, MusicSearchParams } from '../types/music';
import { ApiService, ApiResponse } from './api';

class MusicApiService extends ApiService {
  /**
   * Get all music tracks
   */
  async getAllTracks(): Promise<ApiResponse<MusicTrack[]>> {
    return this.get<MusicTrack[]>('/music/tracks');
  }

  /**
   * Get a specific track by ID
   */
  async getTrackById(id: string): Promise<ApiResponse<MusicTrack>> {
    return this.get<MusicTrack>(`/music/tracks/${id}`);
  }

  /**
   * Add a new music track
   */
  async addTrack(track: CreateMusicTrack): Promise<ApiResponse<MusicTrack>> {
    return this.post<MusicTrack>('/music/tracks', track);
  }

  /**
   * Upload an audio file
   */
  async uploadAudioFile(formData: FormData): Promise<ApiResponse<MusicUploadResponse>> {
    return this.postForm<MusicUploadResponse>('/music/upload', formData);
  }

  /**
   * Update an existing track
   */
  async updateTrack(id: string, track: Partial<CreateMusicTrack>): Promise<ApiResponse<MusicTrack>> {
    return this.put<MusicTrack>(`/music/tracks/${id}`, track);
  }

  /**
   * Delete a track
   */
  async deleteTrack(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/music/tracks/${id}`);
  }

  /**
   * Search tracks
   */
  async searchTracks(params: MusicSearchParams): Promise<ApiResponse<MusicTrack[]>> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.type) queryParams.append('type', params.type);
    if (params.artist) queryParams.append('artist', params.artist);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    
    return this.get<MusicTrack[]>(`/music/search?${queryParams.toString()}`);
  }

  /**
   * Get all playlists
   */
  async getAllPlaylists(): Promise<ApiResponse<MusicPlaylist[]>> {
    return this.get<MusicPlaylist[]>('/music/playlists');
  }

  /**
   * Get a specific playlist by ID
   */
  async getPlaylistById(id: string): Promise<ApiResponse<MusicPlaylist>> {
    return this.get<MusicPlaylist>(`/music/playlists/${id}`);
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(playlist: CreateMusicPlaylist): Promise<ApiResponse<MusicPlaylist>> {
    return this.post<MusicPlaylist>('/music/playlists', playlist);
  }

  /**
   * Update a playlist
   */
  async updatePlaylist(id: string, playlist: Partial<CreateMusicPlaylist>): Promise<ApiResponse<MusicPlaylist>> {
    return this.put<MusicPlaylist>(`/music/playlists/${id}`, playlist);
  }

  /**
   * Delete a playlist
   */
  async deletePlaylist(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/music/playlists/${id}`);
  }

  /**
   * Add tracks to a playlist
   */
  async addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<ApiResponse<MusicPlaylist>> {
    return this.post<MusicPlaylist>(`/music/playlists/${playlistId}/tracks`, { trackIds });
  }

  /**
   * Remove tracks from a playlist
   */
  async removeTracksFromPlaylist(playlistId: string, trackIds: string[]): Promise<ApiResponse<MusicPlaylist>> {
    return this.post<MusicPlaylist>(`/music/playlists/${playlistId}/tracks/remove`, { trackIds });
  }

  /**
   * Get tracks by type (YouTube or audio)
   */
  async getTracksByType(type: 'youtube' | 'audio'): Promise<ApiResponse<MusicTrack[]>> {
    return this.get<MusicTrack[]>(`/music/tracks?type=${type}`);
  }

  /**
   * Get recent tracks
   */
  async getRecentTracks(limit: number = 10): Promise<ApiResponse<MusicTrack[]>> {
    return this.get<MusicTrack[]>(`/music/tracks/recent?limit=${limit}`);
  }

  /**
   * Get popular tracks
   */
  async getPopularTracks(limit: number = 10): Promise<ApiResponse<MusicTrack[]>> {
    return this.get<MusicTrack[]>(`/music/tracks/popular?limit=${limit}`);
  }
}

// Create and export a singleton instance
const musicApi = new MusicApiService();
export { musicApi };
export default musicApi;
