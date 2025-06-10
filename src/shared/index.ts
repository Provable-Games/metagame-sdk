// Dojo client and setup
export { useMetagame, MetagameProvider } from './provider';
export { MetagameClient } from './client';
export { getMetagameClient, initMetagame } from './singleton';

// Utilities
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
} from './utils/dataTransformers';

// Lib utilities
export { feltToString, stringToFelt, bigintToHex, indexAddress } from './lib';

// Types
export type {
  EntityData,
  GameTokenData,
  GameTokenResult,
  ObjectivesLookup,
} from './utils/dataTransformers';
