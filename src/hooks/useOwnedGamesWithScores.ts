import { useMemo } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { gameScoresKeyQuery, ownedGamesWithScoresQuery } from '../queries/sql';
import { getMetagameClient } from '../singleton';
import { feltToString, indexAddress } from '../lib';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';
import { GameScore } from '../types/games';

interface UseOwnedGameProps {
  address: string;
  gameAddress: string;
  metagame?: {
    namespace: string;
    model: string;
    attribute: string;
    key: string;
    attributeFilters?: any[];
  };
  limit?: number;
  offset?: number;
  logging?: boolean;
}

export const useOwnedGamesWithScores = ({
  address,
  gameAddress,
  metagame,
  limit = 100,
  offset = 0,
  logging = false,
}: UseOwnedGameProps): SqlQueryResult<GameScore> => {
  const client = getMetagameClient();
  const { gameScoreModel, gameScoreAttribute, gameNamespace } = useGameEndpoints(gameAddress);
  const gameScoreKey = useMemo(
    () => gameScoresKeyQuery(gameNamespace ?? '', gameScoreModel ?? ''),
    [gameNamespace, gameScoreModel]
  );
  const { data: gameScoreKeyData } = useSqlQuery<{ name: string }>(
    client.getConfig().toriiUrl,
    gameScoreKey,
    logging
  );

  const missingConfig =
    !gameScoreModel || !gameScoreAttribute || !gameNamespace || !gameScoreKeyData[0]?.name;

  let configError = null;
  if (missingConfig) {
    let errorMessage = 'Missing required game configuration: ';
    if (!gameScoreModel) errorMessage += 'Score Model, ';
    if (!gameScoreAttribute) errorMessage += 'Score Attribute, ';
    if (!gameNamespace) errorMessage += 'Namespace, ';
    if (!gameScoreKeyData[0]?.name) errorMessage += 'Score Key, ';
    errorMessage = errorMessage.replace(/, $/, '');
    configError = errorMessage;
  }

  const query = useMemo(
    () =>
      !missingConfig
        ? ownedGamesWithScoresQuery({
            address: indexAddress(address),
            gameAddress: indexAddress(gameAddress),
            gameScoreInfo: {
              gameNamespace: gameNamespace ?? '',
              gameScoreModel: gameScoreModel ?? '',
              gameScoreAttribute: gameScoreAttribute ?? '',
              gameScoreKey: gameScoreKeyData[0]?.name ?? '',
            },
            metagame,
            limit,
            offset,
          })
        : null,
    [
      address,
      gameAddress,
      metagame,
      limit,
      offset,
      gameNamespace,
      gameScoreModel,
      gameScoreAttribute,
      gameScoreKeyData[0]?.name,
    ]
  );
  const {
    data: rawGameData,
    loading,
    error,
    refetch,
  } = useSqlQuery<any>(client.getConfig().toriiUrl, query, logging);

  const gameScores = useMemo(() => {
    if (!rawGameData || !rawGameData.length) return [];

    return rawGameData.map((game) => {
      const filteredGame: GameScore = {
        score: game.score,
        player_name: feltToString(game.player_name),
        token_id: game.token_id,
        metadata: game.metadata,
        minted: Number(game['lifecycle.mint']),
        start: Number(game['lifecycle.start.Some']),
        end: Number(game['lifecycle.end.Some']),
        metagame_data: Number(game['metagame_data']),
        account_address: game.account_address,
        contract_address: game.contract_address,
      };
      return filteredGame;
    });
  }, [rawGameData]);

  return { data: gameScores, loading, error, refetch };
};
