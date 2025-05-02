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

export interface GameScore {
  score: number;
  player_name: string;
  token_id: number;
  minted: number;
  start: number;
  end: number;
  metagame_data?: number;
  account_address?: string;
  contract_address?: string;
}

export interface Score {
  game_id: number;
  score: number;
}

export interface TokenMetadata {
  start: number;
  end: number;
  minted: number;
  minted_by: string;
  player_name: string;
  settings_id: number;
  token_id: number;
}
