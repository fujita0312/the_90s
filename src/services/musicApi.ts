import axios from 'axios';
import { MusicTrack } from '../types/music';
import { ApiService, ApiResponse } from './api';

class MusicApiService extends ApiService {
  /**
   * Get all music
   */
  async getAllMusic(): Promise<ApiResponse<MusicTrack[]>> {
    return this.get<MusicTrack[]>('/music');
  }

  /**
   * Increment play count for a music track
   */
  async playMusic(id: string): Promise<ApiResponse<{ id: string; playCount: number }>> {
    return this.post<{ id: string; playCount: number }>(`/music/${id}/play`);
  }

  /**
   * Upload an audio file
   */
  async uploadAudioFile(formData: FormData): Promise<ApiResponse<MusicTrack>> {
    // Create a custom axios instance with longer timeout for uploads
    const uploadClient = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5003',
      timeout: 600000, // 10 minutes timeout for large file uploads
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    try {
      const response = await uploadClient.post<ApiResponse<MusicTrack>>('/music/upload', formData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as any;
        
        if (axiosError.response) {
          // Server responded with error status
          const responseData = axiosError.response.data as any;
          return {
            success: false,
            error: responseData?.error || `Server error: ${axiosError.response.status}`,
          };
        } else if (axiosError.request) {
          // Request was made but no response received
          return {
            success: false,
            error: 'Network error - please check your connection',
          };
        }
      }
      
      // Other errors
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }
}

// Create and export a singleton instance
const musicApi = new MusicApiService();
export { musicApi };
export default musicApi;
