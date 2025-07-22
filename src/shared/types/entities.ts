// TypeScript interfaces for Cairo events

export interface OwnersUpdate {
  token_id: string | number;
  owner: string;
  auth: string;
}

export interface TokenMetadataUpdate {
  id: string | number;
  game_id: string | number;
  minted_at: string | number;
  settings_id: string | number;
  lifecycle_start: string | number;
  lifecycle_end: string | number;
  minted_by: string | number;
  soulbound: boolean;
  game_over: boolean;
  completed_all_objectives: boolean;
  has_context: boolean;
  objectives_count: number;
  // Dojo SDK may return these as nested properties
  'lifecycle.start'?: string | number;
  'lifecycle.end'?: string | number;
}

export interface TokenCounterUpdate {
  token_address: string;
  counter: string | number;
}

export interface TokenPlayerNameUpdate {
  id: string | number;
  player_name: string;
}

export interface TokenClientUrlUpdate {
  id: string | number;
  client_url: string;
}

export interface TokenScoreUpdate {
  id: string | number;
  score: string | number;
}

export interface ObjectiveCreated {
  game_address: string;
  objective_id: string | number;
  creator_address: string;
  objective_data: string;
}

export interface ObjectiveUpdate {
  token_id: string | number;
  objective_id: string | number;
  completed: boolean;
}

export interface SettingsCreated {
  game_address: string;
  settings_id: string | number;
  creator_address: string;
  settings_data: string;
}

export interface MinterRegistryUpdate {
  id: string | number;
  minter_address: string;
}

export interface MinterCounterUpdate {
  token_address: string;
  counter: string | number;
}

export interface TokenContextUpdate {
  id: string | number;
  context_data: string;
}

export interface TokenRendererUpdate {
  id: string | number;
  renderer_address: string;
}

export interface GameCounterUpdate {
  key: string;
  counter: string | number;
}

export interface GameMetadataUpdate {
  id: string | number;
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
  creator_token_id?: string | number;
}

export interface GameRegistryUpdate {
  id: string | number;
  contract_address: string;
}

// Entity types for subscription hooks
export interface EntityData {
  entityId: string;
  TokenMetadataUpdate?: TokenMetadataUpdate;
  TokenPlayerNameUpdate?: TokenPlayerNameUpdate;
  ObjectiveUpdate?: ObjectiveUpdate;
  TokenContextUpdate?: TokenContextUpdate;
  TokenScoreUpdate?: TokenScoreUpdate;
  GameRegistryUpdate?: GameRegistryUpdate;
  SettingsCreated?: SettingsCreated;
  ObjectiveCreated?: ObjectiveCreated;
  OwnersUpdate?: OwnersUpdate;
  GameMetadataUpdate?: GameMetadataUpdate;
  TokenRendererUpdate?: TokenRendererUpdate;
  TokenClientUrlUpdate?: TokenClientUrlUpdate;
  MinterRegistryUpdate?: MinterRegistryUpdate;
  TokenCounterUpdate?: TokenCounterUpdate;
  MinterCounterUpdate?: MinterCounterUpdate;
  GameCounterUpdate?: GameCounterUpdate;
  [key: string]: any; // Allow for additional properties
}

// Cairo event definitions for reference
/*
#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct OwnersUpdate {
    #[key]
    pub token_id: u64,
    pub owner: ContractAddress,
    pub auth: ContractAddress,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct TokenMetadataUpdate {
    #[key]
    pub id: u64,
    pub game_id: u64,
    pub minted_at: u64,
    pub settings_id: u32,
    pub lifecycle_start: u64,
    pub lifecycle_end: u64,
    pub minted_by: u64,
    pub soulbound: bool,
    pub game_over: bool,
    pub completed_all_objectives: bool,
    pub has_context: bool,
    pub objectives_count: u8,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct TokenCounterUpdate {
    #[key]
    pub token_address: ContractAddress,
    pub counter: u64,
}

#[derive(Drop, Serde)]
#[dojo::event]
pub struct TokenPlayerNameUpdate {
    #[key]
    pub id: u64,
    pub player_name: ByteArray,
}

#[derive(Drop, Serde)]
#[dojo::event]
pub struct TokenClientUrlUpdate {
    #[key]
    pub id: u64,
    pub client_url: ByteArray,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct TokenScoreUpdate {
    #[key]
    pub id: u64,
    pub score: u64,
}

// Objectives extension events
#[derive(Drop, Serde)]
#[dojo::event]
pub struct ObjectiveCreated {
    #[key]
    pub game_address: ContractAddress,
    #[key]
    pub objective_id: u32,
    pub creator_address: ContractAddress,
    pub objective_data: ByteArray,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct ObjectiveUpdate {
    #[key]
    pub token_id: u64,
    pub objective_id: u32,
    pub completed: bool,
}

// Settings extension events
#[derive(Drop, Serde)]
#[dojo::event]
pub struct SettingsCreated {
    #[key]
    pub game_address: ContractAddress,
    #[key]
    pub settings_id: u32,
    pub creator_address: ContractAddress,
    pub settings_data: ByteArray,
}


// Minter extension events
#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct MinterRegistryUpdate {
    #[key]
    pub id: u64,
    pub minter_address: ContractAddress,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct MinterCounterUpdate {
    #[key]
    pub token_address: ContractAddress,
    pub counter: u64,
}

// Context extension events
#[derive(Drop, Serde)]
#[dojo::event]
pub struct TokenContextUpdate {
    #[key]
    pub id: u64,
    pub context_data: ByteArray,
}

// Renderer extension events
#[derive(Drop, Serde)]
#[dojo::event]
pub struct TokenRendererUpdate {
    #[key]
    pub id: u64,
    pub renderer_address: ContractAddress,
}

// MinigameRegistry events
#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct GameCounterUpdate {
    #[key]
    pub key: felt252,
    pub counter: u64,
}

#[derive(Drop, Serde)]
#[dojo::event]
pub struct GameMetadataUpdate {
    #[key]
    pub id: u64,
    pub contract_address: ContractAddress,
    pub name: ByteArray,
    pub description: ByteArray,
    pub developer: ByteArray,
    pub publisher: ByteArray,
    pub genre: ByteArray,
    pub image: ByteArray,
    pub color: ByteArray,
    pub client_url: ByteArray,
    pub renderer_address: ContractAddress,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct GameRegistryUpdate {
    #[key]
    pub id: u64,
    pub contract_address: ContractAddress,
}
*/


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
