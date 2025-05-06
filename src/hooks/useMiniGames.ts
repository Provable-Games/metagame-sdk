import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { getMetagameClient } from '../singleton';
import { miniGamesQuery, gameDataQuery } from '../queries/sql';
import { useCallback, useMemo, useEffect } from 'react';
import { feltToString } from '../lib';
import { GameData } from '../types/games';

interface UseMiniGamesProps {
  gameAddresses?: string[];
  limit?: number;
  offset?: number;
  logging?: boolean;
}

interface MiniGame {
  namespace: string;
}

export const useMiniGames = ({
  gameAddresses,
  limit = 10,
  offset = 0,
  logging = false,
}: UseMiniGamesProps): SqlQueryResult<GameData> => {
  const client = getMetagameClient();

  const {
    data: miniGamesData,
    loading: miniGamesLoading,
    error: miniGamesError,
    refetch: miniGamesRefetch,
  } = useSqlQuery<MiniGame>(client.getConfig().toriiUrl, miniGamesQuery(limit, offset), logging);

  const miniGames = useMemo(() => miniGamesData.map((game) => game.namespace), [miniGamesData]);

  const {
    data: rawGameData,
    loading: gameDataLoading,
    error: gameDataError,
    refetch: gameDataRefetch,
  } = useSqlQuery<GameData>(
    client.getConfig().toriiUrl,
    gameDataQuery(miniGames, gameAddresses),
    logging
  );

  useEffect(() => {
    if (miniGames.length > 0) {
      gameDataRefetch();
    }
  }, [miniGames, gameDataRefetch]);

  const gameData = useMemo(() => {
    return rawGameData.map((game) => {
      const filteredGame: GameData = {
        contract_address: game.contract_address,
        creator_address: game.creator_address,
        name: feltToString(game.name),
        description: game.description,
        image: game.image,
        genre: feltToString(game.genre),
        developer: feltToString(game.developer),
        publisher: feltToString(game.publisher),
      };
      return filteredGame;
    });
  }, [rawGameData]);

  const refetchAll = useCallback(async () => {
    await miniGamesRefetch();
  }, [miniGamesRefetch]);

  return {
    data: gameData,
    loading: miniGamesLoading || gameDataLoading,
    error: miniGamesError || gameDataError,
    refetch: refetchAll,
  };
};
