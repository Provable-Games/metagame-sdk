import { miniGamesQuery } from '../queries/sql';
import { useSqlQuery } from '../services/sqlService';
import { useCallback, useMemo } from 'react';
import { feltToString } from '../../shared/lib';
import { getMetagameClientSafe } from '../../shared/singleton';
import type { GameMetadata } from '../../shared/types';

interface UseMiniGamesProps {
  gameAddresses?: string[];
  limit?: number;
  offset?: number;
  logging?: boolean;
}

export const useMiniGames = ({ gameAddresses, limit = 10, offset = 0 }: UseMiniGamesProps) => {
  const client = getMetagameClientSafe();

  const query = useMemo(() => {
    if (!client) return null;
    return miniGamesQuery({
      namespace: client.getNamespace(),
      gameAddresses,
      limit,
      offset,
    });
  }, [client, gameAddresses, limit, offset]);

  const {
    data: miniGamesData,
    loading: miniGamesLoading,
    error: miniGamesError,
    refetch: miniGamesRefetch,
  } = useSqlQuery(client?.getConfig().toriiUrl || '', query);

  const gameData = useMemo(() => {
    return miniGamesData.map((game: any) => {
      const filteredGame: GameMetadata = {
        game_id: Number(game.id) || 0,
        contract_address: game.contract_address || '',
        name: feltToString(game.name) || '',
        description: game.description || '',
        developer: feltToString(game.developer) || '',
        publisher: feltToString(game.publisher) || '',
        genre: feltToString(game.genre) || '',
        image: game.image || '',
        color: game.color,
        client_url: game.client_url,
        renderer_address: game.renderer_address,
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
