import { Meme, MemeSubmission, PaginatedResponse, MemeQueryParams } from '../types/meme';
import { ApiService, ApiResponse } from './api';

class MemeApiService extends ApiService {
  /**
   * Get all memes from the server
   */
  async getAllMemes(): Promise<ApiResponse<Meme[]>> {
    return this.get<Meme[]>('/memes');
  }

  /**
   * Get paginated memes with search and sort options
   */
  async getMemesPaginated(queryParams: MemeQueryParams): Promise<PaginatedResponse<Meme>> {
    const searchParams = new URLSearchParams();
    
    if (queryParams.page) searchParams.append('page', queryParams.page.toString());
    if (queryParams.limit) searchParams.append('limit', queryParams.limit.toString());
    if (queryParams.search) searchParams.append('search', queryParams.search);
    if (queryParams.sortBy) searchParams.append('sortBy', queryParams.sortBy as any);
    
    const queryString = searchParams.toString();
    const url = `/memes/paginated${queryString ? `?${queryString}` : ''}`;
    
    return this.get<Meme[]>(url) as Promise<PaginatedResponse<Meme>>;
  }

  /**
   * Increment view count for a meme
   */
  async viewMeme(id: string): Promise<ApiResponse<{ id: string; views: number }>> {
    return this.post<{ id: string; views: number }>(`/memes/${id}/view`);
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

  /**
   * Vote on a meme (up or down)
   */
  async voteMeme(id: string, voteType: 'up' | 'down', userId: string): Promise<ApiResponse<Meme>> {
    return this.post<Meme>(`/memes/${id}/vote`, { voteType, userId });
  }
}

// Create and export a singleton instance
const memeApi = new MemeApiService();
export default memeApi;
