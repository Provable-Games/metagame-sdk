export interface GameData {
  contract_address: string;
  creator_address: string;
  description: string;
  developer: string;
  genre: string;
  image: string;
  name: string;
  publisher: string;
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

export interface GameSettingsMetadata {
  name: string;
  description: string;
  created_at: number;
  created_by: string;
  settings_id: number;
}
