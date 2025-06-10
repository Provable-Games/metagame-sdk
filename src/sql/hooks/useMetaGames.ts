import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { getMetagameClient } from '../../shared/singleton';
import { metaGamesQuery } from '../queries/sql';
import { useCallback, useMemo, useEffect } from 'react';
import { feltToString } from '../../shared/lib';

interface UseMetaGamesProps {
  limit?: number;
  offset?: number;
  logging?: boolean;
}

interface MetaGame {
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

export const useMetaGames = ({
  limit = 10,
  offset = 0,
  logging = false,
}: UseMetaGamesProps): SqlQueryResult<GameData> => {
  const client = getMetagameClient();

  const {
    data: metaGamesData,
    loading: metaGamesLoading,
    error: metaGamesError,
    refetch: metaGamesRefetch,
  } = useSqlQuery<MetaGame>(client.getConfig().toriiUrl, metaGamesQuery(limit, offset), logging);

  const metaGames = useMemo(() => metaGamesData.map((game) => game.namespace), [metaGamesData]);

  const {
    data: rawGameData,
    loading: gameDataLoading,
    error: gameDataError,
    refetch: gameDataRefetch,
  } = useSqlQuery<GameData>(client.getConfig().toriiUrl, metaGamesQuery(limit, offset), logging);

  useEffect(() => {
    if (metaGames.length > 0) {
      gameDataRefetch();
    }
  }, [metaGames, gameDataRefetch]);

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
    await metaGamesRefetch();
  }, [metaGamesRefetch]);

  return {
    data: gameData,
    loading: metaGamesLoading || gameDataLoading,
    error: metaGamesError || gameDataError,
    refetch: refetchAll,
  };
};
