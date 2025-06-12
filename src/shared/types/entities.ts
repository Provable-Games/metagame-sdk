// Entity types for subscription hooks
export interface GameEntity {
  entityId: string;
  TokenMetadata?: any;
  TokenPlayerName?: any;
  TokenObjective?: any;
  TokenContextData?: any;
  ScoreUpdate?: any;
  GameRegistry?: any;
  SettingsData?: any;
  ObjectiveData?: any;
  Owners?: any;
  [key: string]: any;
}

export interface MiniGameEntity {
  entityId: string;
  GameMetadata?: {
    id: string | number; // This is the game_id
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

export interface SettingsEntity {
  entityId: string;
  SettingsData?: {
    settings_id: number;
    game_id?: number;
    data: any; // Settings data can be object or string
  };
}

export interface ObjectiveEntity {
  entityId: string;
  ObjectiveData?: {
    objective_id: number;
    game_id: number;
    data: string;
  };
}
