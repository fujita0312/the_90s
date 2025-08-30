import { GuestbookEntry, CreateGuestbookEntry, ApiResponse } from '../types/guestbook';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class GuestbookApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getAllEntries(): Promise<ApiResponse<GuestbookEntry[]>> {
    return this.makeRequest<GuestbookEntry[]>('/guestbook');
  }

  async addEntry(entry: CreateGuestbookEntry): Promise<ApiResponse<GuestbookEntry>> {
    return this.makeRequest<GuestbookEntry>('/guestbook', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async deleteEntry(id: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/guestbook/${id}`, {
      method: 'DELETE',
    });
  }

  async getEntryById(id: number): Promise<ApiResponse<GuestbookEntry>> {
    return this.makeRequest<GuestbookEntry>(`/guestbook/${id}`);
  }
}

export const guestbookApi = new GuestbookApiService();
export default guestbookApi;
