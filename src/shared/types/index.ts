export * from './config';
export * from './games';
export * from './responses';
export * from './entities';
export * from './lookup';
export * from './sql';

// Unified types for both SQL and subscription systems
export interface GameTokenData {
  game_id: number | undefined;
  game_over: boolean | undefined;
  lifecycle: {
    start: number | undefined;
    end: number | undefined;
  };
  minted_at: number | undefined;
  minted_by: number | undefined;
  minted_by_address: string | undefined;
  owner: string | undefined;
  settings_id: number | undefined;
  soulbound: boolean | undefined;
  completed_all_objectives: boolean | undefined;
  token_id: number;
  player_name: string | undefined;
  metadata: any | undefined;
  context: { name: string; description: string; contexts: any } | undefined;
  settings: { name: string; description: string; data: any } | undefined;
  score: number;
  objective_ids: string[];
  renderer: string | undefined;
  client_url: string | undefined;
  gameMetadata:
    | {
        game_id: number;
        contract_address: string;
        name: string;
        description: string;
        developer: string;
        publisher: string;
        genre: string;
        image: string;
        color?: string;
        client_url?: string;
        renderer_address?: string;
      }
    | undefined;
}

export interface GameMetadata {
  game_id: number;
  contract_address: string;
  name: string;
  description: string;
  developer: string;
  publisher: string;
  genre: string;
  image: string;
  color?: string;
  client_url?: string;
  renderer_address?: string;
}

export interface GameSettings {
  settings_id: number;
  gameMetadata: GameMetadata | undefined;
  name: string;
  description: string;
  data: any;
}

export interface GameObjective {
  objective_id: string;
  data: string;
  gameMetadata: GameMetadata | undefined;
}

// Alias for backward compatibility
export type Game = GameTokenData;
export type MiniGame = GameMetadata;
export type MetaGame = GameMetadata;
