import { Meme, MemeSubmission } from '../types/meme';
import { ApiService, ApiResponse } from './api';

class MemeApiService extends ApiService {
  /**
   * Get all memes from the server
   */
  async getAllMemes(): Promise<ApiResponse<Meme[]>> {
    return this.get<Meme[]>('/memes');
  }

  /**
   * Add a new meme to the server
   */
  async addMeme(meme: MemeSubmission): Promise<ApiResponse<Meme>> {
    return this.post<Meme>('/memes', meme);
  }

  /**
   * Upload a meme file to the server
   */
  async uploadMeme(formData: FormData): Promise<ApiResponse<Meme>> {
    console.log('uploadMeme called with FormData:', formData);
    console.log('Making request to: /memes/upload');
    return this.postForm<Meme>('/memes/upload', formData);
  }

  /**
   * Delete a meme by ID
   */
  async deleteMeme(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/memes/${id}`);
  }

  /**
   * Get a specific meme by ID
   */
  async getMemeById(id: string): Promise<ApiResponse<Meme>> {
    return this.get<Meme>(`/memes/${id}`);
  }

  /**
   * Update an existing meme
   */
  async updateMeme(id: string, meme: Partial<MemeSubmission>): Promise<ApiResponse<Meme>> {
    return this.put<Meme>(`/memes/${id}`, meme);
  }
}

// Create and export a singleton instance
const memeApi = new MemeApiService();
export default memeApi;
