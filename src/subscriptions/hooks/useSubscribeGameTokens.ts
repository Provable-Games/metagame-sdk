import { useEffect, useMemo, useState, useCallback } from 'react';
import { useEventSubscription } from '../../shared/dojo/hooks/useEventSubscription';
import { useGameTokensStore } from '../stores/gameTokensStore';
import { useMiniGamesStore } from '../stores/miniGamesStore';
import { gamesQuery } from '../queries/sdk';
import { type GameTokenData } from '../../shared/utils/dataTransformers';
import { getMetagameClientSafe } from '../../shared/singleton';
import { useEnsureMiniGamesStore } from '../utils/ensureMiniGamesStore';

export interface UseSubscribeGameTokensParams {
  owner?: string;
  gameAddresses?: string[];
  tokenIds?: string[];
  hasContext?: boolean;
  context?: {
    name?: string;
    attributes?: Record<string, any>; // Filter by specific attributes within contexts object
  };
  settings_id?: number;
  completed_all_objectives?: boolean;
  soulbound?: boolean;
  objective_id?: string;
  enabled?: boolean;
  pollingInterval?: number;
  minted_by_address?: string; // Add minted by address

  // Pagination parameters
  pagination?: {
    pageSize?: number; // Number of items per page (default: 20)
    initialPage?: number; // Starting page (0-indexed, default: 0)

    // Sorting parameters
    sortBy?: 'score' | 'minted_at' | 'player_name' | 'token_id' | 'game_over' | 'owner' | 'game_id';
    sortOrder?: 'asc' | 'desc'; // Default: 'desc' for score/minted_at, 'asc' for others
  };
}

export interface PaginationControls {
  currentPage: number; // Current page (0-indexed)
  pageSize: number; // Items per page
  totalItems: number; // Total number of items across all pages
  totalPages: number; // Total number of pages
  hasNextPage: boolean; // Whether there's a next page
  hasPreviousPage: boolean; // Whether there's a previous page
  goToPage: (page: number) => void; // Navigate to specific page
  nextPage: () => void; // Go to next page
  previousPage: () => void; // Go to previous page
  firstPage: () => void; // Go to first page
  lastPage: () => void; // Go to last page
}

export interface UseSubscribeGameTokensResult {
  // Subscription status
  isSubscribing: boolean;
  error: Error | null;
  isInitialized: boolean;
  lastUpdated: number;

  // Store data (paginated based on params)
  games: GameTokenData[]; // Paginated games for current page
  allGames: GameTokenData[]; // All filtered games (unpaginated)
  getGameByTokenId: (tokenId: string) => GameTokenData | undefined;

  // Pagination controls
  pagination: PaginationControls;
}

export function useSubscribeGameTokens(
  params: UseSubscribeGameTokensParams = {}
): UseSubscribeGameTokensResult {
  const {
    enabled = true,
    owner,
    gameAddresses,
    tokenIds,
    hasContext,
    context,
    settings_id,
    completed_all_objectives,
    soulbound,
    objective_id,
    pagination,
    minted_by_address,
  } = params;

  // Ensure mini games store is initialized for gameMetadata relationships
  useEnsureMiniGamesStore();

  // Pagination state
  const pageSize = pagination?.pageSize ?? 20;
  const [currentPage, setCurrentPage] = useState(pagination?.initialPage ?? 0);

  // Sorting parameters
  const sortBy = pagination?.sortBy ?? 'minted_at';
  const defaultSortOrder = sortBy === 'score' || sortBy === 'minted_at' ? 'desc' : 'asc';
  const sortOrder = pagination?.sortOrder ?? defaultSortOrder;

  const client = getMetagameClientSafe();

  // Get store state and actions
  const {
    gameTokens,
    isInitialized,
    lastUpdated,
    initializeStore,
    updateEntity,
    clearStore,
    getGameTokensByFilter,
    getGameTokenByTokenId,
  } = useGameTokensStore();

  // Get mini games store for metadata lookup
  const { getMiniGameData } = useMiniGamesStore();

  // Create query only if client is available
  const query = useMemo(() => {
    if (!client) return null;
    return gamesQuery({ namespace: client.getNamespace() });
  }, [client]);

  // Subscribe to events for real-time updates with custom callback
  const {
    entities: events,
    isSubscribed: isSubscribedEvents,
    error: errorEvents,
  } = useEventSubscription(client, {
    query: query || { keys: [], entityModels: [], eventModels: [] },
    namespace: client?.getNamespace() || '',
    enabled: enabled && !!client,
    transform: (entity: any) => {
      if (!client) return entity;

      const { entityId, models } = entity;
      console.log('Raw models from subscription:', models);
      const transformed = {
        entityId,
        ...models[client.getNamespace()],
      };

      // Log specific TokenMetadataUpdate events
      if (transformed.TokenMetadataUpdate) {
        console.log('TokenMetadataUpdate event received:', {
          id: transformed.TokenMetadataUpdate.id,
          game_id: transformed.TokenMetadataUpdate.game_id,
          lifecycle_start: transformed.TokenMetadataUpdate.lifecycle_start,
          lifecycle_end: transformed.TokenMetadataUpdate.lifecycle_end,
          all_fields: transformed.TokenMetadataUpdate,
        });
      }

      // Call our store's updateEntity for real-time updates
      updateEntity(transformed);

      return transformed;
    },
  });

  console.log(query);
  console.log(events);

  // Handle initial load only
  useEffect(() => {
    if (!enabled) return;

    if (events && events.length > 0) {
      console.log('useSubscribeGameTokens: Initial load with', events.length, 'entities');
      initializeStore(events);
    }
  }, [events, initializeStore, enabled]);

  // Clear store when disabled
  useEffect(() => {
    if (!enabled) {
      clearStore();
    }
  }, [enabled, clearStore]);

  // Filter and sort games based on params
  const filteredAndSortedGames = useMemo(() => {
    const result = getGameTokensByFilter({
      owner,
      gameAddresses,
      tokenIds,
      hasContext,
      context,
      settings_id,
      completed_all_objectives,
      soulbound,
      objective_id,
      minted_by_address,
    });

    // Populate gameMetadata from mini games store
    const gamesWithMetadata = result.map((game: GameTokenData) => {
      if (game.game_id && !game.gameMetadata) {
        const miniGameData = getMiniGameData(game.game_id);
        return {
          ...game,
          gameMetadata: miniGameData || undefined,
        };
      }
      return game;
    });

    // Sort games based on sortBy and sortOrder
    const sortedGames = [...gamesWithMetadata].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'score':
          aValue = a.score ?? 0;
          bValue = b.score ?? 0;
          break;
        case 'minted_at':
          // Convert to timestamp for comparison, handle undefined/null
          aValue = a.minted_at ? new Date(a.minted_at).getTime() : 0;
          bValue = b.minted_at ? new Date(b.minted_at).getTime() : 0;
          break;
        case 'player_name':
          aValue = (a.player_name || '').toLowerCase();
          bValue = (b.player_name || '').toLowerCase();
          break;
        case 'token_id':
          aValue = a.token_id || 0;
          bValue = b.token_id || 0;
          break;
        case 'game_over':
          // Sort by game completion status (false first, then true)
          aValue = a.game_over ? 1 : 0;
          bValue = b.game_over ? 1 : 0;
          break;
        case 'owner':
          aValue = (a.owner || '').toLowerCase();
          bValue = (b.owner || '').toLowerCase();
          break;
        case 'game_id':
          aValue = a.game_id || '';
          bValue = b.game_id || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    console.log(
      'useSubscribeGameTokens: filtered and sorted games:',
      sortedGames.length,
      `sorted by ${sortBy} ${sortOrder}`,
      sortedGames.slice(0, 3).map((game) => ({
        token_id: game.token_id,
        game_id: game.game_id,
        lifecycle: game.lifecycle,
        settings_id: game.settings_id,
        minted_at: game.minted_at,
      })) // Log key fields for first 3 games
    );
    console.log('useSubscribeGameTokens: store state:', {
      gameTokens: Object.keys(gameTokens).length,
      isInitialized,
      lastUpdated,
    });
    return sortedGames;
  }, [
    getGameTokensByFilter,
    getMiniGameData,
    owner,
    gameAddresses,
    tokenIds,
    hasContext,
    context,
    settings_id,
    completed_all_objectives,
    soulbound,
    objective_id,
    gameTokens,
    isInitialized,
    lastUpdated,
    sortBy,
    sortOrder,
  ]);

  // Calculate pagination values
  const totalItems = filteredAndSortedGames.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  // Auto-adjust current page if it's beyond available pages
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  // Apply pagination to filtered and sorted games
  const paginatedGames = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedGames.slice(startIndex, endIndex);
  }, [filteredAndSortedGames, currentPage, pageSize]);

  // Pagination control functions
  const goToPage = useCallback(
    (page: number) => {
      const clampedPage = Math.max(0, Math.min(page, totalPages - 1));
      setCurrentPage(clampedPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(Math.max(0, totalPages - 1));
  }, [totalPages]);

  // Pagination controls object
  const paginationControls: PaginationControls = useMemo(
    () => ({
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      goToPage,
      nextPage,
      previousPage,
      firstPage,
      lastPage,
    }),
    [
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      goToPage,
      nextPage,
      previousPage,
      firstPage,
      lastPage,
    ]
  );

  // Return empty state if client is not ready
  if (!client) {
    return {
      // Subscription status
      isSubscribing: false,
      error: null,
      isInitialized: false,
      lastUpdated: 0,

      // Store data (empty)
      games: [],
      allGames: [],
      getGameByTokenId: getGameTokenByTokenId,

      // Pagination controls (default state)
      pagination: {
        currentPage: 0,
        pageSize,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        goToPage,
        nextPage,
        previousPage,
        firstPage,
        lastPage,
      },
    };
  }

  return {
    // Subscription status
    isSubscribing: isSubscribedEvents,
    error: errorEvents || null,
    isInitialized,
    lastUpdated,

    // Store data (paginated and unpaginated)
    games: paginatedGames, // Paginated games for current page
    allGames: filteredAndSortedGames, // All filtered and sorted games (unpaginated)
    getGameByTokenId: getGameTokenByTokenId,

    // Pagination controls
    pagination: paginationControls,
  };
}
