import { useMemo } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { gameScoresKeyQuery, ownedGamesWithScoresQuery } from '../queries/sql';
import { getMetagameClient } from '../singleton';
import { feltToString, indexAddress } from '../lib';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';
import { GameScore } from '../types/games';

interface UseOwnedGameProps {
  address?: string;
  gameAddress?: string;
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
  const gameEndpoints = useGameEndpoints(gameAddress ? [gameAddress] : []);
  const addressEndpoints = gameAddress ? gameEndpoints?.[gameAddress] : undefined;
  const { scoreModel, scoreAttribute, namespace } = addressEndpoints ?? {};

  const gameScoreKey = useMemo(
    () => gameScoresKeyQuery(namespace ?? '', scoreModel ?? ''),
    [namespace, scoreModel]
  );
  const { data: gameScoreKeyData } = useSqlQuery<{ name: string }>(
    client.getConfig().toriiUrl,
    gameScoreKey,
    logging
  );

  if (!address || !gameAddress) {
    console.warn('address and gameAddress are both not provided');
  }

  const missingConfig = !scoreModel || !scoreAttribute || !namespace || !gameScoreKeyData[0]?.name;

  let configError = null;
  if (missingConfig) {
    let errorMessage = 'Missing required game configuration: ';
    if (!scoreModel) errorMessage += 'Score Model, ';
    if (!scoreAttribute) errorMessage += 'Score Attribute, ';
    if (!namespace) errorMessage += 'Namespace, ';
    if (!gameScoreKeyData[0]?.name) errorMessage += 'Score Key, ';
    errorMessage = errorMessage.replace(/, $/, '');
    configError = errorMessage;
  }

  const healthAttribute = useMemo(() => {
    if (namespace === 'ls_0_0_1') return 'health';
    if (namespace === 'ds_v1_2_0') return 'hero_health';
    return undefined;
  }, [namespace]);

  const query = useMemo(
    () =>
      !missingConfig && address && gameAddress
        ? ownedGamesWithScoresQuery({
            address: indexAddress(address),
            gameAddress: indexAddress(gameAddress),
            gameScoreInfo: {
              gameNamespace: namespace ?? '',
              gameScoreModel: scoreModel ?? '',
              gameScoreAttribute: scoreAttribute ?? '',
              gameScoreKey: gameScoreKeyData[0]?.name ?? '',
            },
            metagame,
            healthAttribute: healthAttribute,
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
      namespace,
      scoreModel,
      scoreAttribute,
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
        minted: Number(game['lifecycle.mint']),
        start: Number(game['lifecycle.start.Some']),
        end: Number(game['lifecycle.end.Some']),
        metagame_data: Number(game['metagame_data']),
        account_address: game.account_address,
        contract_address: game.contract_address,
      };
      if (namespace === 'ls_0_0_1') {
        return {
          ...filteredGame,
          health: game.health,
        };
      }
      if (namespace === 'ds_v1_2_0') {
        return {
          ...filteredGame,
          health: game.health,
        };
      }
      return filteredGame;
    });
  }, [rawGameData]);

  return { data: gameScores, loading, error, refetch };
};
