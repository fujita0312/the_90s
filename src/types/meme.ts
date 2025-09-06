export interface Meme {
  id: string;
  imageUrl: string;
  createdAt: string;
  author?: string;
  votes?: number;
  upVotes?: number;
  downVotes?: number;
}

export interface MemeSubmission {
  imageUrl: string;
  author?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  error?: string;
}

export interface MemeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'mostVoted' | 'leastVoted';
}
