export interface MetaGame {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'coming_soon';
  createdAt: string;
  updatedAt: string;
}

export interface MiniGame {
  id: string;
  metaGameId: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'coming_soon';
  gameType: string;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GameInfo {
  id: string;
  type: 'meta' | 'mini';
  name: string;
  description: string;
  stats: {
    players: number;
    totalPlays: number;
    averagePlayTime: number;
  };
  leaderboard?: {
    topPlayers: Array<{
      playerId: string;
      playerName: string;
      score: number;
    }>;
  };
}
