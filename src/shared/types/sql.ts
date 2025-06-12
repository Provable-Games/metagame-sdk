// SQL query result types - Updated to match subscription structure
export interface GameSettings {
  name: string;
  description: string;
  config: Record<string, any>;
}

export interface Game {
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
        creator_token_id: number;
        name: string;
        description: string;
        developer: string;
        publisher: string;
        genre: string;
        image: string;
        color?: string;
      }
    | undefined;
}

export interface MiniGame {
  game_id: number;
  contract_address: string;
  creator_token_id: number;
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
  creator_token_id: number;
  name: string;
  description: string;
  developer: string;
  publisher: string;
  genre: string;
  image: string;
  color?: string;
}
