import { useMemo, useState, useCallback } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { objectivesQuery, objectivesCountQuery } from '../queries/sql';
import { getMetagameClientSafe } from '../../shared/singleton';
import { feltToString } from '../../shared/lib';
import type { GameObjective } from '../../shared/types';
import type { PaginationControls } from './useGameTokens';

interface UseGameObjectivesProps {
  gameAddresses?: string[];
  objectiveIds?: number[];
  limit?: number;
  offset?: number;
  logging?: boolean;
  pagination?: {
    pageSize?: number;
    initialPage?: number;
  };
  // Fetch total count even when pagination is disabled (default: false)
  fetchCount?: boolean;
}

export interface UseObjectivesResult extends Omit<SqlQueryResult<GameObjective>, 'data'> {
  objectives: GameObjective[];
  pagination: PaginationControls;
  // Total count of objectives (only available when pagination is enabled or fetchCount is true)
  totalCount?: number;
}

export const useObjectives = ({
  gameAddresses,
  objectiveIds,
  limit,
  offset = 0,
  logging = false,
  pagination,
  fetchCount = false,
}: UseGameObjectivesProps): UseObjectivesResult => {
  const client = getMetagameClientSafe();
  const toriiUrl = client?.getConfig().toriiUrl || '';

  // Pagination state
  const isPaginationEnabled = !!pagination;
  const pageSize = pagination?.pageSize ?? 100;
  const [currentPage, setCurrentPage] = useState(pagination?.initialPage ?? 0);

  const query = useMemo(() => {
    if (!client) return null;
    return objectivesQuery({
      namespace: client.getNamespace(),
      gameAddresses,
      objectiveIds,
      limit: isPaginationEnabled ? pageSize : limit,
      offset: isPaginationEnabled ? currentPage * pageSize : offset,
    });
  }, [
    client,
    gameAddresses,
    objectiveIds,
    isPaginationEnabled,
    pageSize,
    currentPage,
    limit,
    offset,
  ]);

  const countQuery = useMemo(() => {
    if (!client || (!isPaginationEnabled && !fetchCount)) return null;
    return objectivesCountQuery({
      namespace: client.getNamespace(),
      gameAddresses,
      objectiveIds,
    });
  }, [client, isPaginationEnabled, fetchCount, gameAddresses, objectiveIds]);

  const {
    data: rawObjectivesData,
    loading,
    error: queryError,
    refetch: refetchMain,
  } = useSqlQuery<GameObjective>(toriiUrl, query, logging);

  const {
    data: countData,
    loading: countLoading,
    error: countError,
    refetch: refetchCount,
  } = useSqlQuery(toriiUrl, countQuery, logging);

  const error = queryError || countError;
  const isLoading = loading || countLoading;

  const totalCount = useMemo(() => {
    if (!isPaginationEnabled && !fetchCount) return undefined;
    if (!countData || !countData.length) return 0;
    return Number((countData[0] as any).count) || 0;
  }, [isPaginationEnabled, fetchCount, countData]);

  const totalPages = isPaginationEnabled && totalCount !== undefined ? Math.ceil(totalCount / pageSize) : 1;

  const objectivesData = useMemo(() => {
    if (!rawObjectivesData || !rawObjectivesData.length) return [];

    return rawObjectivesData.map((objective: any) => {
      // Build gameMetadata object if available
      const gameMetadata = objective.game_address
        ? {
            game_id: Number(objective.id) || 0,
            contract_address: objective.contract_address || '',
            name: objective.name || '',
            description: objective.description || '',
            developer: objective.developer || '',
            publisher: objective.publisher || '',
            genre: objective.genre || '',
            image: objective.image || '',
            color: objective.color,
            client_url: objective.client_url,
            renderer_address: objective.renderer_address,
          }
        : undefined;

      return {
        objective_id: objective.objective_id?.toString() || '',
        data: objective.objective_data || objective.data || '', // Support both new and legacy field names
        gameMetadata,
      };
    });
  }, [rawObjectivesData]);

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

    if ((isPaginationEnabled || fetchCount) && refetchCount) {
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
    objectives: objectivesData,
    loading: isLoading,
    error,
    refetch, // Use the combined refetch
    pagination: paginationControls,
    totalCount,
  };
};
