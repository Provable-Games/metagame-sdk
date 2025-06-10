// SQL query result types
export interface GameSettings {
  name: string;
  description: string;
  config: Record<string, any>;
}

export interface Game {
  contract_address: string;
  game_id: number;
  game_over: boolean;
  lifecycle_end: number;
  lifecycle_start: number;
  minted_at: number;
  minted_by: string;
  owner: string;
  settings_id: number;
  settings_data: GameSettings | null;
  soulbound: boolean;
  completed_all_objectives: boolean;
  token_id: number;
  player_name: string;
  metadata: string;
  score: number;
  objective_ids: number[];
  objectives_data: string[];
}

export interface MiniGame {
  game_id: number;
  contract_address: string;
  creator_address: string;
  name: string;
  description: string;
  developer: string;
  publisher: string;
  genre: string;
  image: string;
  color?: string;
}

export interface MetaGame {
  game_id: number;
  contract_address: string;
  creator_address: string;
  name: string;
  description: string;
  developer: string;
  publisher: string;
  genre: string;
  image: string;
  color?: string;
}
