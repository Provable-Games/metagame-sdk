// Lookup types for store data structures
export interface MiniGamesLookup {
  [game_id: string]: {
    game_id: string;
    contract_address: string;
    creator_address: string;
    name: string;
    description: string;
    developer: string;
    publisher: string;
    genre: string;
    image: string;
    color?: string;
  };
}

export interface SettingsLookup {
  [settings_id: number]: {
    game_id: number;
    gameMetadata: {
      game_id: string;
      contract_address: string;
      creator_address: string;
      name: string;
      description: string;
      developer: string;
      publisher: string;
      genre: string;
      image: string;
      color?: string;
    } | null;
    name: string;
    description: string;
    data: any;
  };
}

export interface ObjectivesLookup {
  [objective_id: string]: {
    data: string;
    game_id: number;
    gameMetadata: {
      game_id: string;
      contract_address: string;
      creator_address: string;
      name: string;
      description: string;
      developer: string;
      publisher: string;
      genre: string;
      image: string;
      color?: string;
    } | null;
  };
}

export interface GamesLookup {
  [token_id: string]: {
    contract_address?: string;
    game_id?: string;
    game_over?: boolean;
    lifecycle?: {
      start?: string;
      end?: string;
    };
    minted_at?: string;
    minted_by?: string;
    owner?: string;
    settings_id?: string;
    soulbound?: boolean;
    completed_all_objectives?: boolean;
    token_id?: string;
    player_name?: string;
    metadata?: any;
    context?: any;
    settings_data?: any;
    score?: number;
    objective_ids?: string[];
  };
}
