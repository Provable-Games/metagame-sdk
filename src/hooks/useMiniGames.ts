import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { getMetagameClient } from '../singleton';
import { miniGamesQuery, gameDataQuery } from '../queries/sql';
import { useCallback, useMemo, useEffect } from 'react';
import { feltToString } from '../lib';

interface UseMiniGamesProps {
  limit?: number;
  offset?: number;
  logging?: boolean;
}

interface MiniGame {
  namespace: string;
}

interface GameData {
  contract_address: string;
  creator_address: string;
  description: string;
  developer: string;
  genre: string;
  image: string;
  name: string;
  publisher: string;
}

export const useMiniGames = ({
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
  } = useSqlQuery<GameData>(client.getConfig().toriiUrl, gameDataQuery(miniGames), logging);

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
