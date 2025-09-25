import { useMemo, useState, useCallback } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { gameSettingsQuery, gameSettingsCountQuery } from '../queries/sql';
import { getMetagameClientSafe } from '../../shared/singleton';
import { parseSettingsData } from '../../shared/utils/dataTransformers';
import { feltToString } from '../../shared/lib';
import type { GameSettings } from '../../shared/types';
import type { PaginationControls } from './useGameTokens';

interface UseSettingsProps {
  gameAddresses?: string[];
  settingsIds?: number[];
  limit?: number;
  offset?: number;
  logging?: boolean;
  pagination?: {
    pageSize?: number;
    initialPage?: number;
  };
  // Fetch total count even when pagination is disabled (default: false)
  fetchCount?: boolean;
  // Only fetch count, skip main data query (default: false)
  countOnly?: boolean;
}

export interface UseSettingsResult extends Omit<SqlQueryResult<GameSettings>, 'data'> {
  settings: GameSettings[];
  pagination: PaginationControls;
  // Total count of settings (only available when pagination is enabled or fetchCount is true)
  totalCount?: number;
}

export const useSettings = ({
  gameAddresses,
  settingsIds,
  limit,
  offset = 0,
  logging = false,
  pagination,
  fetchCount = false,
  countOnly = false,
}: UseSettingsProps): UseSettingsResult => {
  const client = getMetagameClientSafe();

  // Pagination state
  const isPaginationEnabled = !!pagination;
  const pageSize = pagination?.pageSize ?? 100;
  const [currentPage, setCurrentPage] = useState(pagination?.initialPage ?? 0);

  const query = useMemo(() => {
    if (!client || countOnly) return null;
    return gameSettingsQuery({
      namespace: client.getNamespace(),
      gameAddresses,
      settingsIds,
      limit: isPaginationEnabled ? pageSize : limit,
      offset: isPaginationEnabled ? currentPage * pageSize : offset,
    });
  }, [
    client,
    countOnly,
    gameAddresses,
    settingsIds,
    isPaginationEnabled,
    pageSize,
    currentPage,
    limit,
    offset,
  ]);

  const countQuery = useMemo(() => {
    if (!client || (!isPaginationEnabled && !fetchCount && !countOnly)) return null;
    return gameSettingsCountQuery({
      namespace: client.getNamespace(),
      gameAddresses,
      settingsIds,
    });
  }, [client, isPaginationEnabled, fetchCount, countOnly, gameAddresses, settingsIds]);

  const {
    data: rawSettingsData,
    loading,
    error: queryError,
    refetch: refetchMain,
  } = useSqlQuery<GameSettings>(client?.getConfig().toriiUrl || '', query, logging);

  const {
    data: countData,
    loading: countLoading,
    error: countError,
    refetch: refetchCount,
  } = useSqlQuery(client?.getConfig().toriiUrl || '', countQuery, true);

  const error = queryError || countError;
  const isLoading = loading || countLoading;

  const totalCount = useMemo(() => {
    if (!isPaginationEnabled && !fetchCount && !countOnly) return undefined;
    if (!countData || !countData.length) return 0;
    return Number((countData[0] as any).count) || 0;
  }, [isPaginationEnabled, fetchCount, countOnly, countData]);

  const totalPages = isPaginationEnabled && totalCount !== undefined ? Math.ceil(totalCount / pageSize) : 1;

  const settingsData = useMemo(() => {
    if (!rawSettingsData || !rawSettingsData.length || countOnly) return [];

    return rawSettingsData.map((settings: any) => {
      const settingsData = settings.settings_data || settings.data; // Support both new and legacy field names
      const parsedSettingsData = parseSettingsData(settingsData);

      const gameMetadata = settings.game_address
        ? {
            game_id: Number(settings.id) || 0,
            contract_address: settings.contract_address || '',
            name: settings.name || '',
            description: settings.description || '',
            developer: settings.developer || '',
            publisher: settings.publisher || '',
            genre: settings.genre || '',
            image: settings.image || '',
            color: settings.color,
            client_url: settings.client_url,
            renderer_address: settings.renderer_address,
          }
        : undefined;

      return {
        settings_id: Number(settings.settings_id) || 0,
        gameMetadata,
        name: parsedSettingsData?.name || '',
        description: parsedSettingsData?.description || '',
        data: parsedSettingsData?.data,
      };
    });
  }, [rawSettingsData, countOnly]);

  const hasNextPage = isPaginationEnabled ? currentPage < totalPages - 1 : false;
  const hasPreviousPage = isPaginationEnabled ? currentPage > 0 : false;

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

  // Create a combined refetch function that refetches both queries
  const refetch = useCallback(async () => {
    const promises: Promise<void>[] = [];

    if (refetchMain) {
      promises.push(refetchMain());
    }

    if ((isPaginationEnabled || fetchCount || countOnly) && refetchCount) {
      promises.push(refetchCount());
    }

    await Promise.all(promises);
  }, [refetchMain, refetchCount, isPaginationEnabled, fetchCount]);

  // Pagination controls object
  const paginationControls: PaginationControls = useMemo(
    () => ({
      currentPage,
      pageSize,
      totalCount: totalCount ?? 0,
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
      totalCount,
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
    settings: settingsData,
    loading: isLoading,
    error,
    refetch, // Use the combined refetch
    pagination: paginationControls,
    totalCount,
  };
};
