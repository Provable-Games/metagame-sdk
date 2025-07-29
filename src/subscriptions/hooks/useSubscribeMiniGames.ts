import { getMetagameClientSafe } from '../../shared/singleton';
import { useEventSubscription } from '../../shared/dojo/hooks/useEventSubscription';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useMiniGamesStore } from '../stores/miniGamesStore';
import { miniGamesQuery } from '../queries/sdk';
import { type GameMetadata } from '../../shared/types';
import { logger } from '../../shared/utils/logger';

export interface UseSubscribeMiniGamesParams {
  enabled?: boolean;
  logging?: boolean;
  // Filter options (now consistent with SQL)
  gameAddresses?: string[];
  creatorTokenId?: number;

  // Pagination parameters
  pagination?: {
    pageSize?: number; // Number of items per page (default: 20)
    initialPage?: number; // Starting page (0-indexed, default: 0)
    // Sorting parameters
    sortBy?: 'game_id' | 'name' | 'developer' | 'genre' | 'creator_token_id';
    sortOrder?: 'asc' | 'desc'; // Default: 'asc'
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

type MiniGamesRecord = Record<string, GameMetadata>;

export interface UseSubscribeMiniGamesResult {
  // Subscription status
  isSubscribed: boolean;
  error: any;

  // Store data (paginated, indexed by game_id)
  miniGames: MiniGamesRecord; // Paginated mini games for current page
  allMiniGames: MiniGamesRecord; // All filtered mini games (unpaginated)
  getMiniGameData: (game_id: string | number) => any;
  getMiniGameByContractAddress: (contract_address: string) => any;
  isInitialized: boolean;

  // Pagination controls
  pagination: PaginationControls;
}

export function useSubscribeMiniGames(
  params: UseSubscribeMiniGamesParams = {}
): UseSubscribeMiniGamesResult {
  const client = getMetagameClientSafe();
  const { enabled = true, logging = false, gameAddresses, creatorTokenId, pagination } = params;

  // Pagination state
  const pageSize = pagination?.pageSize ?? 20;
  const [currentPage, setCurrentPage] = useState(pagination?.initialPage ?? 0);

  // Sorting parameters
  const sortBy = pagination?.sortBy ?? 'name';
  const sortOrder = pagination?.sortOrder ?? 'asc';

  // Create query only if client is available
  const query = useMemo(() => {
    if (!client) return null;
    return miniGamesQuery({ namespace: client.getNamespace() });
  }, [client]);

  logger.debug(query);
  logger.debug('client', client);

  const {
    entities: events,
    isSubscribed,
    error,
  } = useEventSubscription(client, {
    query: query || { keys: [], entityModels: [], eventModels: [] },
    namespace: client?.getNamespace() || '',
    enabled: enabled && !!client,
    logging,
    transform: (entity: any) => {
      if (!client) return entity;

      const { entityId, models } = entity;
      logger.debug(models);
      const transformed = {
        entityId,
        ...models[client.getNamespace()],
      };

      // Call our store's updateEntity for real-time updates
      logger.debug('transformed', transformed);
      updateEntity(transformed);

      return transformed;
    },
  });

  logger.debug(events, error, isSubscribed);

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
    if (events && events.length > 0) {
      logger.debug('Initializing mini games store with', events.length, 'entities');
      initializeStore(events);
    }
  }, [events, initializeStore]);

  // Apply filters to get filtered mini games (updated for new structure)
  const filteredMiniGames = getMiniGamesByFilter({
    gameAddresses,
    creatorTokenId,
  });

  // Convert to array and sort for pagination
  const sortedMiniGamesArray = useMemo(() => {
    const miniGamesArray = Object.entries(filteredMiniGames);

    // Sort mini games based on sortBy and sortOrder
    return miniGamesArray.sort(([keyA, gameA], [keyB, gameB]) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'game_id':
          aValue = gameA.game_id || '';
          bValue = gameB.game_id || '';
          break;
        case 'name':
          aValue = (gameA.name || '').toLowerCase();
          bValue = (gameB.name || '').toLowerCase();
          break;
        case 'developer':
          aValue = (gameA.developer || '').toLowerCase();
          bValue = (gameB.developer || '').toLowerCase();
          break;
        case 'genre':
          aValue = (gameA.genre || '').toLowerCase();
          bValue = (gameB.genre || '').toLowerCase();
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
  }, [filteredMiniGames, sortBy, sortOrder]);

  // Calculate pagination values
  const totalItems = sortedMiniGamesArray.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  // Auto-adjust current page if it's beyond available pages
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  // Apply pagination to sorted mini games
  const paginatedMiniGames = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedArray = sortedMiniGamesArray.slice(startIndex, endIndex);

    // Convert back to record
    return Object.fromEntries(paginatedArray);
  }, [sortedMiniGamesArray, currentPage, pageSize]);

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
      isSubscribed: false,
      error: null,

      // Store data (empty)
      miniGames: {},
      allMiniGames: {},
      getMiniGameData,
      getMiniGameByContractAddress,
      isInitialized: false,

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
    isSubscribed,
    error,

    // Store data (paginated and unpaginated)
    miniGames: paginatedMiniGames, // Paginated mini games for current page
    allMiniGames: filteredMiniGames, // All filtered mini games (unpaginated)
    getMiniGameData,
    getMiniGameByContractAddress,
    isInitialized,

    // Pagination controls
    pagination: paginationControls,
  };
}
