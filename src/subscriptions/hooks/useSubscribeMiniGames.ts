import { getMetagameClient } from '../../shared/singleton';
import { useEntitySubscription } from '../../shared/dojo/hooks/useEntitySubscription';
import { useEffect } from 'react';
import { useMiniGamesStore } from '../stores/miniGamesStore';
import { miniGamesQuery } from '../queries/sdk';

export interface UseSubscribeMiniGamesParams {
  enabled?: boolean;
  logging?: boolean;
  // Filter options (same as useMergedMiniGames)
  game_ids?: string[] | number[];
  contract_addresses?: string[];
  creator_address?: string;
}

export interface UseSubscribeMiniGamesResult {
  // Subscription status
  isSubscribed: boolean;
  error: any;

  // Store data (now indexed by game_id)
  miniGames: Record<
    string,
    {
      game_id: string;
      contract_address: string;
      creator_address: string;
      name: string;
      description: string;
      developer: string;
      publisher: string;
      genre: string;
      image: string;
      color?: string;
    }
  >;
  getMiniGameData: (game_id: string | number) => any;
  getMiniGameByContractAddress: (contract_address: string) => any;
  isInitialized: boolean;
}

export function useSubscribeMiniGames(
  params: UseSubscribeMiniGamesParams = {}
): UseSubscribeMiniGamesResult {
  const client = getMetagameClient();
  const { enabled = true, logging = false, game_ids, contract_addresses, creator_address } = params;

  const query = miniGamesQuery({ namespace: client.getNamespace() });

  const { entities, isSubscribed, error } = useEntitySubscription(client, {
    query,
    namespace: client.getNamespace(),
    enabled,
    logging,
  });

  const {
    initializeStore,
    updateEntity,
    miniGames,
    isInitialized,
    getMiniGamesByFilter,
    getMiniGameData,
    getMiniGameByContractAddress,
  } = useMiniGamesStore();

  // Initialize store with all entities on first load
  useEffect(() => {
    if (entities && entities.length > 0) {
      console.log('Initializing mini games store with', entities.length, 'entities');
      initializeStore(entities);
    }
  }, [entities, initializeStore]);

  // Apply filters to get filtered mini games (updated for new structure)
  const filteredMiniGames = getMiniGamesByFilter({
    game_ids,
    contract_addresses,
    creator_address,
  });

  return {
    // Subscription status
    isSubscribed,
    error,

    // Store data (filtered based on params)
    miniGames: filteredMiniGames,
    getMiniGameData,
    getMiniGameByContractAddress,
    isInitialized,
  };
}
