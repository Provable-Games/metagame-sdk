import type { SchemaType as ISchemaType } from '@dojoengine/sdk';

import { BigNumberish } from 'starknet';

// Type definition for `denshokan::models::game::Score` struct
export interface Score {
  token_id: BigNumberish;
  score: BigNumberish;
}

// Type definition for `denshokan::models::game::ScoreValue` struct
export interface ScoreValue {
  score: BigNumberish;
}

// Type definition for `denshokan::models::game::SettingsCounter` struct
export interface SettingsCounter {
  key: BigNumberish;
  count: BigNumberish;
}

// Type definition for `denshokan::models::game::SettingsCounterValue` struct
export interface SettingsCounterValue {
  count: BigNumberish;
}

// Type definition for `denshokan::models::game::SettingsDetails` struct
export interface SettingsDetails {
  id: BigNumberish;
  name: BigNumberish;
  description: string;
  exists: boolean;
}

// Type definition for `denshokan::models::game::SettingsDetailsValue` struct
export interface SettingsDetailsValue {
  name: BigNumberish;
  description: string;
  exists: boolean;
}

// Type definition for `denshokan::models::lifecycle::Lifecycle` struct
export interface Lifecycle {
  start: BigNumberish;
  end: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::GameCounter` struct
export interface GameCounter {
  key: BigNumberish;
  count: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::GameCounterValue` struct
export interface GameCounterValue {
  count: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::GameMetadata` struct
export interface GameMetadata {
  id: BigNumberish;
  creator_token_id: BigNumberish;
  contract_address: string;
  name: BigNumberish;
  description: string;
  developer: BigNumberish;
  publisher: BigNumberish;
  genre: BigNumberish;
  image: string;
  color: string;
}

// Type definition for `denshokan::models::denshokan::GameMetadataValue` struct
export interface GameMetadataValue {
  creator_token_id: BigNumberish;
  contract_address: string;
  name: BigNumberish;
  description: string;
  developer: BigNumberish;
  publisher: BigNumberish;
  genre: BigNumberish;
  image: string;
  color: string;
}

// Type definition for `denshokan::models::denshokan::GameRegistry` struct
export interface GameRegistry {
  contract_address: string;
  id: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::GameRegistryValue` struct
export interface GameRegistryValue {
  id: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::MinterCounter` struct
export interface MinterCounter {
  key: BigNumberish;
  count: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::MinterCounterValue` struct
export interface MinterCounterValue {
  count: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::MinterRegistry` struct
export interface MinterRegistry {
  contract_address: string;
  id: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::MinterRegistryId` struct
export interface MinterRegistryId {
  id: BigNumberish;
  contract_address: string;
}

// Type definition for `denshokan::models::denshokan::MinterRegistryIdValue` struct
export interface MinterRegistryIdValue {
  contract_address: string;
}

// Type definition for `denshokan::models::denshokan::MinterRegistryValue` struct
export interface MinterRegistryValue {
  id: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::TokenCounter` struct
export interface TokenCounter {
  key: BigNumberish;
  count: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::TokenCounterValue` struct
export interface TokenCounterValue {
  count: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::TokenMetadata` struct
export interface TokenMetadata {
  id: BigNumberish;
  game_id: BigNumberish;
  minted_at: BigNumberish;
  settings_id: BigNumberish;
  lifecycle: Lifecycle;
  minted_by: BigNumberish;
  soulbound: boolean;
  game_over: boolean;
  task_completed: boolean;
}

// Type definition for `denshokan::models::denshokan::TokenMetadataValue` struct
export interface TokenMetadataValue {
  game_id: BigNumberish;
  minted_at: BigNumberish;
  settings_id: BigNumberish;
  lifecycle: Lifecycle;
  minted_by: BigNumberish;
  soulbound: boolean;
  game_over: boolean;
  task_completed: boolean;
}

// Type definition for `denshokan::models::denshokan::TokenPlayerName` struct
export interface TokenPlayerName {
  id: BigNumberish;
  player_name: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::TokenPlayerNameValue` struct
export interface TokenPlayerNameValue {
  player_name: BigNumberish;
}

// Type definition for `denshokan::denshokan::denshokan::Owners` struct
export interface Owners {
  token_id: BigNumberish;
  owner: string;
}

// Type definition for `denshokan::denshokan::denshokan::OwnersValue` struct
export interface OwnersValue {
  owner: string;
}

// Type definition for `denshokan::denshokan::denshokan::RegisterGame` struct
export interface RegisterGame {
  game_id: BigNumberish;
  namespace: string;
  score_model: string;
  score_attribute: string;
  settings_model: string;
}

// Type definition for `denshokan::denshokan::denshokan::RegisterGameValue` struct
export interface RegisterGameValue {
  namespace: string;
  score_model: string;
  score_attribute: string;
  settings_model: string;
}

// Type definition for `denshokan::denshokan::denshokan::ScoreUpdate` struct
export interface ScoreUpdate {
  token_id: BigNumberish;
  score: BigNumberish;
}

// Type definition for `denshokan::denshokan::denshokan::ScoreUpdateValue` struct
export interface ScoreUpdateValue {
  score: BigNumberish;
}

export interface SchemaType extends ISchemaType {
  denshokan: {
    Score: Score;
    ScoreValue: ScoreValue;
    SettingsCounter: SettingsCounter;
    SettingsCounterValue: SettingsCounterValue;
    SettingsDetails: SettingsDetails;
    SettingsDetailsValue: SettingsDetailsValue;
    Lifecycle: Lifecycle;
    GameCounter: GameCounter;
    GameCounterValue: GameCounterValue;
    GameMetadata: GameMetadata;
    GameMetadataValue: GameMetadataValue;
    GameRegistry: GameRegistry;
    GameRegistryValue: GameRegistryValue;
    MinterCounter: MinterCounter;
    MinterCounterValue: MinterCounterValue;
    MinterRegistry: MinterRegistry;
    MinterRegistryId: MinterRegistryId;
    MinterRegistryIdValue: MinterRegistryIdValue;
    MinterRegistryValue: MinterRegistryValue;
    TokenCounter: TokenCounter;
    TokenCounterValue: TokenCounterValue;
    TokenMetadata: TokenMetadata;
    TokenMetadataValue: TokenMetadataValue;
    TokenPlayerName: TokenPlayerName;
    TokenPlayerNameValue: TokenPlayerNameValue;
    Owners: Owners;
    OwnersValue: OwnersValue;
    RegisterGame: RegisterGame;
    RegisterGameValue: RegisterGameValue;
    ScoreUpdate: ScoreUpdate;
    ScoreUpdateValue: ScoreUpdateValue;
  };
}
export const schema: SchemaType = {
  denshokan: {
    Score: {
      token_id: 0,
      score: 0,
    },
    ScoreValue: {
      score: 0,
    },
    SettingsCounter: {
      key: 0,
      count: 0,
    },
    SettingsCounterValue: {
      count: 0,
    },
    SettingsDetails: {
      id: 0,
      name: 0,
      description: '',
      exists: false,
    },
    SettingsDetailsValue: {
      name: 0,
      description: '',
      exists: false,
    },
    Lifecycle: {
      start: 0,
      end: 0,
    },
    GameCounter: {
      key: 0,
      count: 0,
    },
    GameCounterValue: {
      count: 0,
    },
    GameMetadata: {
      id: 0,
      creator_token_id: 0,
      contract_address: '',
      name: 0,
      description: '',
      developer: 0,
      publisher: 0,
      genre: 0,
      image: '',
      color: '',
    },
    GameMetadataValue: {
      creator_token_id: 0,
      contract_address: '',
      name: 0,
      description: '',
      developer: 0,
      publisher: 0,
      genre: 0,
      image: '',
      color: '',
    },
    GameRegistry: {
      contract_address: '',
      id: 0,
    },
    GameRegistryValue: {
      id: 0,
    },
    MinterCounter: {
      key: 0,
      count: 0,
    },
    MinterCounterValue: {
      count: 0,
    },
    MinterRegistry: {
      contract_address: '',
      id: 0,
    },
    MinterRegistryId: {
      id: 0,
      contract_address: '',
    },
    MinterRegistryIdValue: {
      contract_address: '',
    },
    MinterRegistryValue: {
      id: 0,
    },
    TokenCounter: {
      key: 0,
      count: 0,
    },
    TokenCounterValue: {
      count: 0,
    },
    TokenMetadata: {
      id: 0,
      game_id: 0,
      minted_at: 0,
      settings_id: 0,
      lifecycle: { start: 0, end: 0 },
      minted_by: 0,
      soulbound: false,
      game_over: false,
      task_completed: false,
    },
    TokenMetadataValue: {
      game_id: 0,
      minted_at: 0,
      settings_id: 0,
      lifecycle: { start: 0, end: 0 },
      minted_by: 0,
      soulbound: false,
      game_over: false,
      task_completed: false,
    },
    TokenPlayerName: {
      id: 0,
      player_name: 0,
    },
    TokenPlayerNameValue: {
      player_name: 0,
    },
    Owners: {
      token_id: 0,
      owner: '',
    },
    OwnersValue: {
      owner: '',
    },
    RegisterGame: {
      game_id: 0,
      namespace: '',
      score_model: '',
      score_attribute: '',
      settings_model: '',
    },
    RegisterGameValue: {
      namespace: '',
      score_model: '',
      score_attribute: '',
      settings_model: '',
    },
    ScoreUpdate: {
      token_id: 0,
      score: 0,
    },
    ScoreUpdateValue: {
      score: 0,
    },
  },
};

export function getModelsMapping(namespace: string) {
  return {
    Score: `${namespace}-Score` as const,
    ScoreValue: `${namespace}-ScoreValue` as const,
    SettingsCounter: `${namespace}-SettingsCounter` as const,
    SettingsCounterValue: `${namespace}-SettingsCounterValue` as const,
    SettingsDetails: `${namespace}-SettingsDetails` as const,
    SettingsDetailsValue: `${namespace}-SettingsDetailsValue` as const,
    Lifecycle: `${namespace}-Lifecycle` as const,
    GameCounter: `${namespace}-GameCounter` as const,
    GameCounterValue: `${namespace}-GameCounterValue` as const,
    GameMetadata: `${namespace}-GameMetadata` as const,
    GameMetadataValue: `${namespace}-GameMetadataValue` as const,
    GameRegistry: `${namespace}-GameRegistry` as const,
    GameRegistryValue: `${namespace}-GameRegistryValue` as const,
    MinterCounter: `${namespace}-MinterCounter` as const,
    MinterCounterValue: `${namespace}-MinterCounterValue` as const,
    MinterRegistry: `${namespace}-MinterRegistry` as const,
    MinterRegistryId: `${namespace}-MinterRegistryId` as const,
    MinterRegistryIdValue: `${namespace}-MinterRegistryIdValue` as const,
    MinterRegistryValue: `${namespace}-MinterRegistryValue` as const,
    TokenCounter: `${namespace}-TokenCounter` as const,
    TokenCounterValue: `${namespace}-TokenCounterValue` as const,
    TokenMetadata: `${namespace}-TokenMetadata` as const,
    TokenMetadataValue: `${namespace}-TokenMetadataValue` as const,
    TokenPlayerName: `${namespace}-TokenPlayerName` as const,
    TokenPlayerNameValue: `${namespace}-TokenPlayerNameValue` as const,
    Owners: `${namespace}-Owners` as const,
    OwnersValue: `${namespace}-OwnersValue` as const,
    RegisterGame: `${namespace}-RegisterGame` as const,
    RegisterGameValue: `${namespace}-RegisterGameValue` as const,
    ScoreUpdate: `${namespace}-ScoreUpdate` as const,
    ScoreUpdateValue: `${namespace}-ScoreUpdateValue` as const,
  };
}
