import { gameScoresQuery } from '../queries/sql';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { getMetagameClient } from '../singleton';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';
import { indexAddress } from '../lib';

interface GameScoresQueryParams {
  gameAddress: string;
  gameIds?: string[];
  limit?: number;
  offset?: number;
}

interface GameScores {
  score: number;
  playerName: string;
  tokenId: string;
  metadata: string;
  tokenBalanceId: string;
}

export const useGameScores = ({
  gameAddress,
  gameIds,
  limit = 100,
  offset = 0,
}: GameScoresQueryParams): SqlQueryResult<GameScores> => {
  const client = getMetagameClient();
  const { gameScoreModel, gameScoreAttribute, gameNamespace } = useGameEndpoints(gameAddress);

  // Check for required endpoints
  const missingConfig = !gameScoreModel || !gameScoreAttribute || !gameNamespace;

  // Create error message if config is missing
  let configError = null;
  if (missingConfig) {
    let errorMessage = 'Missing required game configuration: ';
    if (!gameScoreModel) errorMessage += 'Score Model, ';
    if (!gameScoreAttribute) errorMessage += 'Score Attribute, ';
    if (!gameNamespace) errorMessage += 'Namespace, ';

    // Remove trailing comma and space
    errorMessage = errorMessage.replace(/, $/, '');
    configError = new Error(errorMessage);
  }

  // Always call useSqlQuery, but with an empty query if config is missing
  const {
    data,
    loading,
    error: queryError,
    refetch,
  } = useSqlQuery<GameScores>(
    client.getConfig().toriiUrl,
    missingConfig
      ? 'SELECT 1 WHERE 0' // Empty query that returns no results
      : gameScoresQuery({
          gameIds,
          gameAddress: indexAddress(gameAddress),
          gameNamespace: gameNamespace!,
          gameScoreModel: gameScoreModel!,
          gameScoreAttribute: gameScoreAttribute!,
          limit,
          offset,
        })
  );

  // Combine the config error with any query error
  const error = configError || queryError;

  return {
    data: missingConfig ? [] : data,
    loading: !missingConfig && loading,
    error: error as string | null,
    refetch,
  };
};
