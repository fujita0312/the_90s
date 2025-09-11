import { ApiService, ApiResponse } from './api';

export interface GameVisit {
  gameId: string;
  count: number;
  lastVisitedAt: string;
}

class GameApiService extends ApiService {
  async incrementVisit(gameId: string): Promise<ApiResponse<GameVisit>> {
    return this.post(`/games/${encodeURIComponent(gameId)}/visit`);
  }

  async getAllVisits(): Promise<ApiResponse<GameVisit[]>> {
    return this.get(`/games/visits`);
  }

  async getVisit(gameId: string): Promise<ApiResponse<GameVisit | null>> {
    return this.get(`/games/${encodeURIComponent(gameId)}/visit`);
  }
}

export const gameApi = new GameApiService();


