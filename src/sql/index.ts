// SQL query hooks
export { useGames } from './hooks/useGames';
export { useMiniGames } from './hooks/useMiniGames';
export { useMetaGames } from './hooks/useMetaGames';
export { useGameSettings } from './hooks/useGameSettings';

// SQL queries (for advanced usage)
export * from './queries/sql';

// SQL service (for advanced usage)
export { useSqlQuery, executeSqlQuery } from './services/sqlService';
export type { SqlQueryResult } from './services/sqlService';

// Types
export type { Game, MiniGame, MetaGame, GameSettings } from '../shared/types';
