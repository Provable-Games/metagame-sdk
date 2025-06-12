import { getMetagameClient } from '../../shared/singleton';
import { useEventSubscription } from '../../shared/dojo/hooks/useEventSubscription';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useObjectivesStore } from '../stores/objectivesStore';
import { objectivesQuery } from '../queries/sdk';
import { useEnsureMiniGamesStore } from '../utils/ensureMiniGamesStore';

export interface UseSubscribeObjectivesParams {
  enabled?: boolean;
  logging?: boolean;
  // Filter options (now consistent with SQL)
  gameAddresses?: string[];
  objectiveIds?: number[];

  // Pagination parameters
  pagination?: {
    pageSize?: number; // Number of items per page (default: 20)
    initialPage?: number; // Starting page (0-indexed, default: 0)
    // Sorting parameters
    sortBy?: 'game_id' | 'data';
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

type ObjectivesRecord = Record<
  string,
  {
    data: string;
    game_id: number;
    gameMetadata: {
      game_id: number;
      contract_address: string;
      creator_token_id: number;
      name: string;
      description: string;
      developer: string;
      publisher: string;
      genre: string;
      image: string;
      color?: string;
    } | null;
  }
>;

export interface UseSubscribeObjectivesResult {
  // Subscription status
  isSubscribed: boolean;
  error: any;

  // Store data with complete game metadata (paginated)
  objectives: ObjectivesRecord; // Paginated objectives for current page
  allObjectives: ObjectivesRecord; // All filtered objectives (unpaginated)
  getObjectiveData: (objective_id: string) => string | null;
  getObjectivesForGame: (objective_ids: string[], game_id: string | number) => string[];
  isInitialized: boolean;

  // Pagination controls
  pagination: PaginationControls;
}

export function useSubscribeObjectives(
  params: UseSubscribeObjectivesParams = {}
): UseSubscribeObjectivesResult {
  const client = getMetagameClient();
  const { enabled = true, logging = false, gameAddresses, objectiveIds, pagination } = params;

  // Ensure mini games store is initialized for gameMetadata relationships
  useEnsureMiniGamesStore();

  // Pagination state
  const pageSize = pagination?.pageSize ?? 20;
  const [currentPage, setCurrentPage] = useState(pagination?.initialPage ?? 0);

  // Sorting parameters
  const sortBy = pagination?.sortBy ?? 'game_id';
  const sortOrder = pagination?.sortOrder ?? 'asc';

  const query = objectivesQuery({ namespace: client.getNamespace() });

  const { entities, isSubscribed, error } = useEventSubscription(client, {
    query,
    namespace: client.getNamespace(),
    enabled,
    logging,
    transform: (entity: any) => {
      const { entityId, models } = entity;
      const transformed = {
        entityId,
        ...models[client.getNamespace()],
      };

      // Call our store's updateEntity for real-time updates
      updateEntity(transformed);

      return transformed;
    },
  });

  const {
    initializeStore,
    updateEntity,
    isInitialized,
    getObjectivesByFilter,
    getObjectiveData,
    getObjectivesForGame,
  } = useObjectivesStore();

  // Initialize store with all entities on first load
  useEffect(() => {
    if (entities && entities.length > 0) {
      console.log('Initializing objectives store with', entities.length, 'entities');
      initializeStore(entities);
    }
  }, [entities, initializeStore]);

  // Apply filters to get filtered objectives (same logic as useMergedObjectives)
  const filteredObjectives = getObjectivesByFilter({
    gameAddresses,
    objectiveIds,
  });

  // Convert to array and sort for pagination
  const sortedObjectivesArray = useMemo(() => {
    const objectivesArray = Object.entries(filteredObjectives);

    // Sort objectives based on sortBy and sortOrder
    return objectivesArray.sort(([keyA, objectiveA], [keyB, objectiveB]) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'game_id':
          aValue = objectiveA.game_id ?? 0;
          bValue = objectiveB.game_id ?? 0;
          break;
        case 'data':
          aValue = (objectiveA.data || '').toLowerCase();
          bValue = (objectiveB.data || '').toLowerCase();
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
  }, [filteredObjectives, sortBy, sortOrder]);

  // Calculate pagination values
  const totalItems = sortedObjectivesArray.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  // Auto-adjust current page if it's beyond available pages
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  // Apply pagination to sorted objectives
  const paginatedObjectives = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedArray = sortedObjectivesArray.slice(startIndex, endIndex);

    // Convert back to record
    return Object.fromEntries(paginatedArray);
  }, [sortedObjectivesArray, currentPage, pageSize]);

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

  return {
    // Subscription status
    isSubscribed,
    error,

    // Store data (paginated and unpaginated)
    objectives: paginatedObjectives, // Paginated objectives for current page
    allObjectives: filteredObjectives, // All filtered objectives (unpaginated)
    getObjectiveData,
    getObjectivesForGame,
    isInitialized,

    // Pagination controls
    pagination: paginationControls,
  };
}
