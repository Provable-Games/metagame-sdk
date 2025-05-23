import { gameScoresQuery, gameScoresKeyQuery } from '../queries/sql';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { getMetagameClient } from '../singleton';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';
import { feltToString } from '../lib';
import { useMemo } from 'react';

interface GameScoresQueryParams {
  gameAddress: string;
  gameIds?: string[];
  limit?: number;
  offset?: number;
}

interface GameScores {
  score: number;
  player_name: string;
  token_id: string;
  metadata: string;
  minted: number;
  start: number;
  end: number;
}

export const useGameScores = ({
  gameAddress,
  gameIds,
  limit = 100,
  offset = 0,
}: GameScoresQueryParams): SqlQueryResult<GameScores> => {
  const client = getMetagameClient();
  const gameEndpoints = useGameEndpoints([gameAddress]);
  const addressEndpoints = gameEndpoints?.[gameAddress];
  const { scoreModel, scoreAttribute, namespace } = addressEndpoints ?? {};

  const { data: gameScoreKey } = useSqlQuery<{ name: string }>(
    client.getConfig().toriiUrl,
    gameScoresKeyQuery(namespace ?? '', scoreModel ?? '')
  );

  const missingConfig = !scoreModel || !scoreAttribute || !namespace || !gameScoreKey[0]?.name;

  let configError = null;
  if (missingConfig) {
    let errorMessage = 'Missing required game configuration: ';
    if (!scoreModel) errorMessage += 'Score Model, ';
    if (!scoreAttribute) errorMessage += 'Score Attribute, ';
    if (!namespace) errorMessage += 'Namespace, ';
    if (!gameScoreKey[0]?.name) errorMessage += 'Score Key, ';
    errorMessage = errorMessage.replace(/, $/, '');
    configError = errorMessage;
  }

  const query = !missingConfig
    ? gameScoresQuery({
        gameIds,
        gameAddress,
        gameNamespace: namespace ?? '',
        gameScoreModel: scoreModel ?? '',
        gameScoreAttribute: scoreAttribute ?? '',
        gameScoreKey: gameScoreKey[0].name,
        limit,
        offset,
      })
    : null;

  const {
    data: rawGameData,
    loading,
    error: queryError,
    refetch,
  } = useSqlQuery<any>(client.getConfig().toriiUrl, query);

  const error = configError || queryError;

  const gameScores = useMemo(() => {
    if (!rawGameData || !rawGameData.length) return [];

    return rawGameData.map((game) => {
      const filteredGame: GameScores = {
        score: game.score,
        player_name: feltToString(game.player_name),
        token_id: game.token_id,
        metadata: game.metadata,
        minted: Number(game['lifecycle.mint']),
        start: Number(game['lifecycle.start.Some']),
        end: Number(game['lifecycle.end.Some']),
      };
      return filteredGame;
    });
  }, [rawGameData]);

  return {
    data: gameScores,
    loading: !missingConfig && loading,
    error,
    refetch,
  };
};
