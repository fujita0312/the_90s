import { MusicTrack, CreateMusicTrack, MusicUploadResponse } from '../types/music';
import { ApiService, ApiResponse } from './api';

class MusicApiService extends ApiService {
  /**
   * Get all music
   */
  async getAllMusic(): Promise<ApiResponse<MusicTrack[]>> {
    return this.get<MusicTrack[]>('/music');
  }

  /**
   * Upload an audio file
   */
  async uploadAudioFile(formData: FormData): Promise<ApiResponse<MusicUploadResponse>> {
    return this.postForm<MusicUploadResponse>('/music/upload', formData);
  }
}

// Create and export a singleton instance
const musicApi = new MusicApiService();
export { musicApi };
export default musicApi;
