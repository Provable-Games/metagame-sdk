// SQL query hooks
export { useGameTokens } from './hooks/useGameTokens';
export { useMiniGames } from './hooks/useMiniGames';
export { useSettings } from './hooks/useSettings';
export { useObjectives } from './hooks/useObjectives';
export { useGameTokenRanking, useGameLeaderboard } from './hooks/useGameTokenRanking';

// SQL count hooks (optimized for count-only queries)
export { useGameTokensCount } from './hooks/useGameTokensCount';
export { useMiniGamesCount } from './hooks/useMiniGamesCount';
export { useSettingsCount } from './hooks/useSettingsCount';
export { useObjectivesCount } from './hooks/useObjectivesCount';

// Count hook result types
export type { UseGameTokensCountResult } from './hooks/useGameTokensCount';
export type { UseMiniGamesCountResult } from './hooks/useMiniGamesCount';
export type { UseSettingsCountResult } from './hooks/useSettingsCount';
export type { UseObjectivesCountResult } from './hooks/useObjectivesCount';

// SQL queries (for advanced usage)
export * from './queries/sql';

// SQL service (for advanced usage)
export { useSqlQuery, executeSqlQuery } from './services/sqlService';
export type { SqlQueryResult } from './services/sqlService';

// Types
export type {
  Game,
  MiniGame,
  MetaGame,
  GameSettings,
  GameRankingData,
  GameRankingParams,
  GameLeaderboardEntry,
  GameLeaderboardParams,
} from '../shared/types';
