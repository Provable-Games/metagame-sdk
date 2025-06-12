import { miniGamesQuery } from '../queries/sql';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { useCallback, useMemo } from 'react';
import { feltToString } from '../../shared/lib';
import { getMetagameClient } from '../../shared/singleton';
import type { GameMetadata } from '../../shared/types';

interface UseMiniGamesProps {
  gameAddresses?: string[];
  limit?: number;
  offset?: number;
  logging?: boolean;
}

export const useMiniGames = ({ gameAddresses, limit = 10, offset = 0 }: UseMiniGamesProps) => {
  const client = getMetagameClient();

  const query = miniGamesQuery({
    namespace: client.getNamespace(),
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
      const filteredGame: GameMetadata = {
        game_id: Number(game.id) || 0,
        contract_address: game.contract_address || '',
        creator_token_id: Number(game.creator_token_id) || 0,
        name: feltToString(game.name) || '',
        description: game.description || '',
        developer: feltToString(game.developer) || '',
        publisher: feltToString(game.publisher) || '',
        genre: feltToString(game.genre) || '',
        image: game.image || '',
        color: game.color,
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
