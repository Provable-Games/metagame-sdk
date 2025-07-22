import { getMetagameClient } from '../../shared/singleton';
import { useEventSubscription } from '../../shared/dojo/hooks/useEventSubscription';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { settingsQuery } from '../queries/sdk';
import { useEnsureMiniGamesStore } from '../utils/ensureMiniGamesStore';
import { type GameMetadata } from '../../shared/types';

export interface UseSubscribeSettingsParams {
  enabled?: boolean;
  logging?: boolean;
  // Filter options (now consistent with SQL)
  gameAddresses?: string[];
  settingsIds?: number[];

  // Pagination parameters
  pagination?: {
    pageSize?: number; // Number of items per page (default: 20)
    initialPage?: number; // Starting page (0-indexed, default: 0)
    // Sorting parameters
    sortBy?: 'game_id' | 'name' | 'description';
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

type SettingsRecord = Record<
  string,
  {
    game_id: number;
    gameMetadata: GameMetadata | null;
    name: string;
    description: string;
    data: any;
  }
>;

export interface UseSubscribeSettingsResult {
  // Subscription status
  isSubscribed: boolean;
  error: any;

  // Store data with complete game metadata (paginated)
  settings: SettingsRecord; // Paginated settings for current page
  allSettings: SettingsRecord; // All filtered settings (unpaginated)
  getSettingsData: (settings_id: string) => any;
  isInitialized: boolean;

  // Pagination controls
  pagination: PaginationControls;
}

export function useSubscribeSettings(
  params: UseSubscribeSettingsParams = {}
): UseSubscribeSettingsResult {
  const client = getMetagameClient();
  const { enabled = true, logging = false, gameAddresses, settingsIds, pagination } = params;

  // Ensure mini games store is initialized for gameMetadata relationships
  useEnsureMiniGamesStore();

  // Pagination state
  const pageSize = pagination?.pageSize ?? 20;
  const [currentPage, setCurrentPage] = useState(pagination?.initialPage ?? 0);

  // Sorting parameters
  const sortBy = pagination?.sortBy ?? 'game_id';
  const sortOrder = pagination?.sortOrder ?? 'asc';

  const query = settingsQuery({ namespace: client.getNamespace() });

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
    settings,
    isInitialized,
    getSettingsByFilter,
    getSettingsData,
  } = useSettingsStore();

  // Initialize store with all entities on first load
  useEffect(() => {
    if (entities && entities.length > 0) {
      console.log('Initializing settings store with', entities.length, 'entities');
      initializeStore(entities);
    }
  }, [entities, initializeStore]);

  // Apply filters to get filtered settings (same logic as useMergedSettings)
  const filteredSettings = getSettingsByFilter({
    gameAddresses,
    settingsIds,
  });

  // Convert to array and sort for pagination
  const sortedSettingsArray = useMemo(() => {
    const settingsArray = Object.entries(filteredSettings);

    // Sort settings based on sortBy and sortOrder
    return settingsArray.sort(([keyA, settingA], [keyB, settingB]) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'game_id':
          aValue = settingA.game_id ?? 0;
          bValue = settingB.game_id ?? 0;
          break;
        case 'name':
          aValue = (settingA.name || '').toLowerCase();
          bValue = (settingB.name || '').toLowerCase();
          break;
        case 'description':
          aValue = (settingA.description || '').toLowerCase();
          bValue = (settingB.description || '').toLowerCase();
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
  }, [filteredSettings, sortBy, sortOrder]);

  // Calculate pagination values
  const totalItems = sortedSettingsArray.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  // Auto-adjust current page if it's beyond available pages
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  // Apply pagination to sorted settings
  const paginatedSettings = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedArray = sortedSettingsArray.slice(startIndex, endIndex);

    // Convert back to record
    return Object.fromEntries(paginatedArray);
  }, [sortedSettingsArray, currentPage, pageSize]);

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
    settings: paginatedSettings, // Paginated settings for current page
    allSettings: filteredSettings, // All filtered settings (unpaginated)
    getSettingsData,
    isInitialized,

    // Pagination controls
    pagination: paginationControls,
  };
}
