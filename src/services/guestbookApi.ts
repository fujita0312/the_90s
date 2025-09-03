import { GuestbookEntry, CreateGuestbookEntry, ApiResponse } from '../types/guestbook';
import { ApiService } from './api';

class GuestbookApiService extends ApiService {
  /**
   * Get all guestbook entries from the server
   */
  async getAllEntries(): Promise<ApiResponse<GuestbookEntry[]>> {
    return this.get<GuestbookEntry[]>('/guestbook');
  }

  /**
   * Add a new guestbook entry
   */
  async addEntry(entry: CreateGuestbookEntry): Promise<ApiResponse<GuestbookEntry>> {
    return this.post<GuestbookEntry>('/guestbook', entry);
  }

  /**
   * Delete a guestbook entry by ID
   */
  async deleteEntry(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/guestbook/${id}`);
  }

  /**
   * Get a specific guestbook entry by ID
   */
  async getEntryById(id: number): Promise<ApiResponse<GuestbookEntry>> {
    return this.get<GuestbookEntry>(`/guestbook/${id}`);
  }

  /**
   * Update an existing guestbook entry
   */
  async updateEntry(id: number, entry: Partial<CreateGuestbookEntry>): Promise<ApiResponse<GuestbookEntry>> {
    return this.put<GuestbookEntry>(`/guestbook/${id}`, entry);
  }

  /**
   * Get guestbook entries with pagination
   */
  async getEntriesPaginated(page: number = 1, limit: number = 10): Promise<ApiResponse<GuestbookEntry[]>> {
    return this.get<GuestbookEntry[]>(`/guestbook?page=${page}&limit=${limit}`);
  }
}

// Create and export a singleton instance
const guestbookApi = new GuestbookApiService();
export { guestbookApi };
export default guestbookApi;
