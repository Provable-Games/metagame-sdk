import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { BigNumberish } from "starknet";

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

// Type definition for `denshokan::models::denshokan::GameRegistryId` struct
export interface GameRegistryId {
  id: BigNumberish;
  contract_address: string;
}

// Type definition for `denshokan::models::denshokan::GameRegistryIdValue` struct
export interface GameRegistryIdValue {
  contract_address: string;
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

// Type definition for `denshokan::models::denshokan::TokenClientUrl` struct
export interface TokenClientUrl {
  id: BigNumberish;
  client_url: string;
}

// Type definition for `denshokan::models::denshokan::TokenClientUrlValue` struct
export interface TokenClientUrlValue {
  client_url: string;
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
  completed_all_objectives: boolean;
  has_context: boolean;
  objectives_count: BigNumberish;
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
  completed_all_objectives: boolean;
  has_context: boolean;
  objectives_count: BigNumberish;
}

// Type definition for `denshokan::models::denshokan::TokenObjective` struct
export interface TokenObjective {
  id: BigNumberish;
  index: BigNumberish;
  objective_id: BigNumberish;
  completed: boolean;
}

// Type definition for `denshokan::models::denshokan::TokenObjectiveValue` struct
export interface TokenObjectiveValue {
  objective_id: BigNumberish;
  completed: boolean;
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

// Type definition for `denshokan::models::denshokan::TokenRenderer` struct
export interface TokenRenderer {
  id: BigNumberish;
  renderer_address: string;
}

// Type definition for `denshokan::models::denshokan::TokenRendererValue` struct
export interface TokenRendererValue {
  renderer_address: string;
}

// Type definition for `denshokan::models::lifecycle::Lifecycle` struct
export interface Lifecycle {
  start: BigNumberish;
  end: BigNumberish;
}

// Type definition for `game_components_metagame::tests::models::metagame::Context` struct
export interface Context {
  token_id: BigNumberish;
  context: string;
  exists: boolean;
}

// Type definition for `game_components_metagame::tests::models::metagame::ContextValue` struct
export interface ContextValue {
  context: string;
  exists: boolean;
}

// Type definition for `game_components_minigame::tests::models::minigame::Score` struct
export interface Score {
  token_id: BigNumberish;
  score: BigNumberish;
}

// Type definition for `game_components_minigame::tests::models::minigame::ScoreObjective` struct
export interface ScoreObjective {
  id: BigNumberish;
  score: BigNumberish;
  exists: boolean;
}

// Type definition for `game_components_minigame::tests::models::minigame::ScoreObjectiveCount` struct
export interface ScoreObjectiveCount {
  key: BigNumberish;
  count: BigNumberish;
}

// Type definition for `game_components_minigame::tests::models::minigame::ScoreObjectiveCountValue` struct
export interface ScoreObjectiveCountValue {
  count: BigNumberish;
}

// Type definition for `game_components_minigame::tests::models::minigame::ScoreObjectiveValue` struct
export interface ScoreObjectiveValue {
  score: BigNumberish;
  exists: boolean;
}

// Type definition for `game_components_minigame::tests::models::minigame::ScoreValue` struct
export interface ScoreValue {
  score: BigNumberish;
}

// Type definition for `game_components_minigame::tests::models::minigame::Settings` struct
export interface Settings {
  id: BigNumberish;
  difficulty: BigNumberish;
}

// Type definition for `game_components_minigame::tests::models::minigame::SettingsCounter` struct
export interface SettingsCounter {
  key: BigNumberish;
  count: BigNumberish;
}

// Type definition for `game_components_minigame::tests::models::minigame::SettingsCounterValue` struct
export interface SettingsCounterValue {
  count: BigNumberish;
}

// Type definition for `game_components_minigame::tests::models::minigame::SettingsDetails` struct
export interface SettingsDetails {
  id: BigNumberish;
  name: string;
  description: string;
  exists: boolean;
}

// Type definition for `game_components_minigame::tests::models::minigame::SettingsDetailsValue` struct
export interface SettingsDetailsValue {
  name: string;
  description: string;
  exists: boolean;
}

// Type definition for `game_components_minigame::tests::models::minigame::SettingsValue` struct
export interface SettingsValue {
  difficulty: BigNumberish;
}

// Type definition for `denshokan::denshokan::denshokan::ObjectiveData` struct
export interface ObjectiveData {
  game_id: BigNumberish;
  objective_id: BigNumberish;
  data: string;
}

// Type definition for `denshokan::denshokan::denshokan::ObjectiveDataValue` struct
export interface ObjectiveDataValue {
  data: string;
}

// Type definition for `denshokan::denshokan::denshokan::Owners` struct
export interface Owners {
  token_id: BigNumberish;
  owner: string;
  auth: string;
}

// Type definition for `denshokan::denshokan::denshokan::OwnersValue` struct
export interface OwnersValue {
  owner: string;
  auth: string;
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

// Type definition for `denshokan::denshokan::denshokan::SettingsData` struct
export interface SettingsData {
  game_id: BigNumberish;
  settings_id: BigNumberish;
  data: string;
}

// Type definition for `denshokan::denshokan::denshokan::SettingsDataValue` struct
export interface SettingsDataValue {
  data: string;
}

export interface SchemaType extends ISchemaType {
  [namespace: string]: {
    GameCounter: GameCounter;
    GameCounterValue: GameCounterValue;
    GameMetadata: GameMetadata;
    GameMetadataValue: GameMetadataValue;
    GameRegistry: GameRegistry;
    GameRegistryId: GameRegistryId;
    GameRegistryIdValue: GameRegistryIdValue;
    GameRegistryValue: GameRegistryValue;
    MinterCounter: MinterCounter;
    MinterCounterValue: MinterCounterValue;
    MinterRegistry: MinterRegistry;
    MinterRegistryId: MinterRegistryId;
    MinterRegistryIdValue: MinterRegistryIdValue;
    MinterRegistryValue: MinterRegistryValue;
    TokenClientUrl: TokenClientUrl;
    TokenClientUrlValue: TokenClientUrlValue;
    TokenCounter: TokenCounter;
    TokenCounterValue: TokenCounterValue;
    TokenMetadata: TokenMetadata;
    TokenMetadataValue: TokenMetadataValue;
    TokenObjective: TokenObjective;
    TokenObjectiveValue: TokenObjectiveValue;
    TokenPlayerName: TokenPlayerName;
    TokenPlayerNameValue: TokenPlayerNameValue;
    TokenRenderer: TokenRenderer;
    TokenRendererValue: TokenRendererValue;
    Lifecycle: Lifecycle;
  };
}

export function getSchemaWithnamespace(namespace: string): SchemaType {
  return {
    [namespace]: schemaTemplate,
  };
}

export const schemaTemplate: {
  [K in keyof SchemaType[string]]: SchemaType[string][K];
} = {
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
    contract_address: "",
    name: 0,
    description: "",
    developer: 0,
    publisher: 0,
    genre: 0,
    image: "",
    color: "",
  },
  GameMetadataValue: {
    creator_token_id: 0,
    contract_address: "",
    name: 0,
    description: "",
    developer: 0,
    publisher: 0,
    genre: 0,
    image: "",
    color: "",
  },
  GameRegistry: {
    contract_address: "",
    id: 0,
  },
  GameRegistryId: {
    id: 0,
    contract_address: "",
  },
  GameRegistryIdValue: {
    contract_address: "",
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
    contract_address: "",
    id: 0,
  },
  MinterRegistryId: {
    id: 0,
    contract_address: "",
  },
  MinterRegistryIdValue: {
    contract_address: "",
  },
  MinterRegistryValue: {
    id: 0,
  },
  TokenClientUrl: {
    id: 0,
    client_url: "",
  },
  TokenClientUrlValue: {
    client_url: "",
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
    completed_all_objectives: false,
    has_context: false,
    objectives_count: 0,
  },
  TokenMetadataValue: {
    game_id: 0,
    minted_at: 0,
    settings_id: 0,
    lifecycle: { start: 0, end: 0 },
    minted_by: 0,
    soulbound: false,
    game_over: false,
    completed_all_objectives: false,
    has_context: false,
    objectives_count: 0,
  },
  TokenObjective: {
    id: 0,
    index: 0,
    objective_id: 0,
    completed: false,
  },
  TokenObjectiveValue: {
    objective_id: 0,
    completed: false,
  },
  TokenPlayerName: {
    id: 0,
    player_name: 0,
  },
  TokenPlayerNameValue: {
    player_name: 0,
  },
  TokenRenderer: {
    id: 0,
    renderer_address: "",
  },
  TokenRendererValue: {
    renderer_address: "",
  },
  Lifecycle: {
    start: 0,
    end: 0,
  },
};

export function getModelsMapping(namespace: string) {
  return {
    GameCounter: `${namespace}-GameCounter`,
    GameCounterValue: `${namespace}-GameCounterValue`,
    GameMetadata: `${namespace}-GameMetadata`,
    GameMetadataValue: `${namespace}-GameMetadataValue`,
    GameRegistry: `${namespace}-GameRegistry`,
    GameRegistryId: `${namespace}-GameRegistryId`,
    GameRegistryIdValue: `${namespace}-GameRegistryIdValue`,
    GameRegistryValue: `${namespace}-GameRegistryValue`,
    MinterCounter: `${namespace}-MinterCounter`,
    MinterCounterValue: `${namespace}-MinterCounterValue`,
    MinterRegistry: `${namespace}-MinterRegistry`,
    MinterRegistryId: `${namespace}-MinterRegistryId`,
    MinterRegistryIdValue: `${namespace}-MinterRegistryIdValue`,
    MinterRegistryValue: `${namespace}-MinterRegistryValue`,
    TokenClientUrl: `${namespace}-TokenClientUrl`,
    TokenClientUrlValue: `${namespace}-TokenClientUrlValue`,
    TokenCounter: `${namespace}-TokenCounter`,
    TokenCounterValue: `${namespace}-TokenCounterValue`,
    TokenMetadata: `${namespace}-TokenMetadata`,
    TokenMetadataValue: `${namespace}-TokenMetadataValue`,
    TokenObjective: `${namespace}-TokenObjective`,
    TokenObjectiveValue: `${namespace}-TokenObjectiveValue`,
    TokenPlayerName: `${namespace}-TokenPlayerName`,
    TokenPlayerNameValue: `${namespace}-TokenPlayerNameValue`,
    TokenRenderer: `${namespace}-TokenRenderer`,
    TokenRendererValue: `${namespace}-TokenRendererValue`,
    Lifecycle: `${namespace}-Lifecycle`,
    Context: `${namespace}-Context`,
    ContextValue: `${namespace}-ContextValue`,
    Score: `${namespace}-Score`,
    ScoreObjective: `${namespace}-ScoreObjective`,
    ScoreObjectiveCount: `${namespace}-ScoreObjectiveCount`,
    ScoreObjectiveCountValue: `${namespace}-ScoreObjectiveCountValue`,
    ScoreObjectiveValue: `${namespace}-ScoreObjectiveValue`,
    ScoreValue: `${namespace}-ScoreValue`,
    Settings: `${namespace}-Settings`,
    SettingsCounter: `${namespace}-SettingsCounter`,
    SettingsCounterValue: `${namespace}-SettingsCounterValue`,
    SettingsDetails: `${namespace}-SettingsDetails`,
    SettingsDetailsValue: `${namespace}-SettingsDetailsValue`,
    SettingsValue: `${namespace}-SettingsValue`,
    ObjectiveData: `${namespace}-ObjectiveData`,
    ObjectiveDataValue: `${namespace}-ObjectiveDataValue`,
    Owners: `${namespace}-Owners`,
    OwnersValue: `${namespace}-OwnersValue`,
    ScoreUpdate: `${namespace}-ScoreUpdate`,
    ScoreUpdateValue: `${namespace}-ScoreUpdateValue`,
    SettingsData: `${namespace}-SettingsData`,
    SettingsDataValue: `${namespace}-SettingsDataValue`,
  };
}
