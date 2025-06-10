import { useEffect, useMemo } from 'react';
import { useEntitySubscription } from '../../shared/dojo/hooks/useEntitySubscription';
import { useEventSubscription } from '../../shared/dojo/hooks/useEventSubscription';
import { useMergedGamesStore } from '../stores/mergedGamesStore';
import { useMiniGamesStore } from '../stores/miniGamesStore';
import { gamesQuery } from '../queries/sdk';
import { mergeMultipleEndpoints, type GameTokenData } from '../../shared/utils/dataTransformers';
import { getMetagameClient } from '../../shared/singleton';

interface UseSubscribeGamesOptions {
  // Query options
  owner?: string;
  gameAddresses?: string[];
  tokenIds?: string[];
  hasContext?: boolean;

  // Subscription options
  enabled?: boolean;
  pollingInterval?: number;
}

export interface UseSubscribeGamesParams {
  owner?: string;
  gameAddresses?: string[];
  tokenIds?: string[];
  hasContext?: boolean;
  enabled?: boolean;
  pollingInterval?: number;
}

export interface UseSubscribeGamesResult {
  // Subscription status
  isSubscribing: boolean;
  error: Error | null;
  isInitialized: boolean;
  lastUpdated: number;

  // Store data (filtered based on params)
  games: GameTokenData[];
  getGameByTokenId: (tokenId: string) => GameTokenData | undefined;
}

export function useSubscribeGames(params: UseSubscribeGamesParams = {}): UseSubscribeGamesResult {
  const { enabled = true, owner, gameAddresses, tokenIds, hasContext } = params;

  const client = getMetagameClient();

  // Get store state and actions
  const {
    gameTokens,
    isInitialized,
    lastUpdated,
    initializeStore,
    clearStore,
    getGameTokensByFilter,
    getGameTokenByTokenId,
  } = useMergedGamesStore();

  // Get mini games store for metadata lookup
  const { getMiniGameData } = useMiniGamesStore();

  // Subscribe to entity changes
  const { entities, error, isSubscribed } = useEntitySubscription(client, {
    query: gamesQuery({ namespace: client.getNamespace() }),
    namespace: client.getNamespace(),
    enabled,
  });

  // Subscribe to events for real-time updates
  const {
    entities: events,
    isSubscribed: isSubscribedEvents,
    error: errorEvents,
  } = useEventSubscription(client, {
    query: gamesQuery({ namespace: client.getNamespace() }),
    namespace: client.getNamespace(),
    enabled,
  });

  // Initialize store with fetched data
  useEffect(() => {
    console.log('useSubscribeGames: entities received:', entities?.length || 0, entities);
    console.log('useSubscribeGames: events received:', events?.length || 0, events);

    if ((entities || events) && enabled) {
      // Merge entities from both sources
      const allEntities = mergeMultipleEndpoints(entities || [], events || []);
      console.log('useSubscribeGames: merged entities:', allEntities.length, allEntities);

      if (allEntities.length > 0) {
        console.log('Initializing game tokens store with', allEntities.length, 'entities');
        initializeStore(allEntities);
      }
    }
  }, [entities, events, initializeStore, enabled]);

  // Clear store when disabled
  useEffect(() => {
    if (!enabled) {
      clearStore();
    }
  }, [enabled, clearStore]);

  // Filter games based on params
  const filteredGames = useMemo(() => {
    const result = getGameTokensByFilter({
      owner,
      gameAddresses,
      tokenIds,
      hasContext,
    });

    // Populate gameMetadata from mini games store
    const gamesWithMetadata = result.map((game) => {
      if (game.game_id && !game.gameMetadata) {
        const miniGameData = getMiniGameData(game.game_id);
        return {
          ...game,
          gameMetadata: miniGameData || undefined,
        };
      }
      return game;
    });

    console.log('useSubscribeGames: filtered games:', gamesWithMetadata.length, gamesWithMetadata);
    console.log('useSubscribeGames: store state:', {
      gameTokens: Object.keys(gameTokens).length,
      isInitialized,
      lastUpdated,
    });
    return gamesWithMetadata;
  }, [
    getGameTokensByFilter,
    getMiniGameData,
    owner,
    gameAddresses,
    tokenIds,
    hasContext,
    gameTokens,
    isInitialized,
    lastUpdated,
  ]);

  return {
    // Subscription status
    isSubscribing: isSubscribed && isSubscribedEvents,
    error: error || errorEvents || null,
    isInitialized,
    lastUpdated,

    // Store data (filtered based on params)
    games: filteredGames,
    getGameByTokenId: getGameTokenByTokenId,
  };
}
