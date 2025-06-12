// ===== CLIENT AND SETUP =====
export { MetagameClient } from './client';
export { getMetagameClient, initMetagame, resetMetagame } from './singleton';

// ===== UTILITIES =====
export {
  mergeGameEntities,
  filterGames,
  paginateGames,
  mergeMultipleEndpoints,
  memoizeTransform,
  batchProcess,
  mergeGameEntitiesOptimized,
  mergeGameEntitiesCompat,
  buildObjectivesLookup,
  buildMiniGamesLookup,
  getObjectivesForGame,
  parseContextData,
  parseSettingsData,
} from './utils/dataTransformers';

// ===== LIB UTILITIES =====
export { feltToString, stringToFelt, bigintToHex, indexAddress } from './lib';

// ===== TYPES =====
export type { EntityData, GameTokenResult, ObjectiveLookup } from './utils/dataTransformers';
export type { MetagameConfig } from './types/config';

// Unified types (re-export from shared types)
export type {
  GameTokenData,
  GameMetadata,
  GameSettings,
  GameObjective,
  Game,
  MiniGame,
  MetaGame,
} from './types';

// Entity and lookup types
export type * from './types/entities';
export type * from './types/lookup';
