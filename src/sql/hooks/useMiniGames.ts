import { miniGamesQuery } from '../queries/sql';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { useCallback, useMemo } from 'react';
import { feltToString } from '../../shared/lib';
import { getMetagameClient } from '../../shared/singleton';

interface GameData {
  id: string;
  contract_address: string;
  creator_address: string;
  description: string;
  developer: string;
  genre: string;
  image: string;
  name: string;
  publisher: string;
}

interface UseMiniGamesProps {
  namespace: string;
  gameAddresses?: string[];
  limit?: number;
  offset?: number;
  logging?: boolean;
}

export const useMiniGames = ({
  namespace,
  gameAddresses,
  limit = 10,
  offset = 0,
}: UseMiniGamesProps) => {
  const client = getMetagameClient();

  const query = miniGamesQuery({
    namespace,
    gameAddresses,
    limit,
    offset,
  });

  const {
    data: miniGamesData,
    loading: miniGamesLoading,
    error: miniGamesError,
    refetch: miniGamesRefetch,
  } = useSqlQuery(client.getConfig().toriiUrl, query);

  const gameData = useMemo(() => {
    return miniGamesData.map((game: any) => {
      const filteredGame: GameData = {
        id: game.id,
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
  }, [miniGamesData]);

  const refetchAll = useCallback(async () => {
    await miniGamesRefetch();
  }, [miniGamesRefetch]);

  return {
    data: gameData,
    loading: miniGamesLoading,
    error: miniGamesError,
    refetch: refetchAll,
  };
};
