export interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  timestamp: string;
}

export interface CreateGuestbookEntry {
  name: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface GuestbookListResponse extends ApiResponse<GuestbookEntry[]> {}
export interface GuestbookCreateResponse extends ApiResponse<GuestbookEntry> {}
