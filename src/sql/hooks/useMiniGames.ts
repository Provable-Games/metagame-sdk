import { miniGamesQuery, miniGamesCountQuery } from '../queries/sql';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { useCallback, useMemo, useState } from 'react';
import { feltToString } from '../../shared/lib';
import { getMetagameClientSafe } from '../../shared/singleton';
import type { GameMetadata } from '../../shared/types';
import type { PaginationControls } from './useGameTokens';

interface UseMiniGamesProps {
  gameAddresses?: string[];
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

export interface UseMiniGamesResult extends Omit<SqlQueryResult<GameMetadata>, 'data'> {
  minigames: GameMetadata[];
  pagination: PaginationControls;
  // Total count of minigames (only available when pagination is enabled or fetchCount is true)
  totalCount?: number;
}

export const useMiniGames = ({
  gameAddresses,
  limit,
  offset = 0,
  pagination,
  fetchCount = false,
  countOnly = false,
}: UseMiniGamesProps): UseMiniGamesResult => {
  const client = getMetagameClientSafe();

  // Pagination state
  const isPaginationEnabled = !!pagination;
  const pageSize = pagination?.pageSize ?? 100;
  const [currentPage, setCurrentPage] = useState(pagination?.initialPage ?? 0);

  const query = useMemo(() => {
    if (!client || countOnly) return null;
    return miniGamesQuery({
      namespace: client.getNamespace(),
      gameAddresses,
      limit: isPaginationEnabled ? pageSize : limit,
      offset: isPaginationEnabled ? currentPage * pageSize : offset,
    });
  }, [client, countOnly, gameAddresses, isPaginationEnabled, pageSize, currentPage, limit, offset]);

  const countQuery = useMemo(() => {
    if (!client || (!isPaginationEnabled && !fetchCount && !countOnly)) return null;
    return miniGamesCountQuery({
      namespace: client.getNamespace(),
      gameAddresses,
    });
  }, [client, isPaginationEnabled, fetchCount, countOnly, gameAddresses]);

  const {
    data: miniGamesData,
    loading: miniGamesLoading,
    error: miniGamesError,
    refetch: miniGamesRefetch,
  } = useSqlQuery(client?.getConfig().toriiUrl || '', query);

  const {
    data: countData,
    loading: countLoading,
    error: countError,
    refetch: refetchCount,
  } = useSqlQuery(client?.getConfig().toriiUrl || '', countQuery, true);

  const error = miniGamesError || countError;
  const isLoading = miniGamesLoading || countLoading;

  const totalCount = useMemo(() => {
    if (!isPaginationEnabled && !fetchCount && !countOnly) return undefined;
    if (!countData || !countData.length) return 0;
    return Number((countData[0] as any).count) || 0;
  }, [isPaginationEnabled, fetchCount, countOnly, countData]);

  const totalPages = isPaginationEnabled && totalCount !== undefined ? Math.ceil(totalCount / pageSize) : 1;

  const gameData = useMemo(() => {
    if (!miniGamesData || !miniGamesData.length || countOnly) return [];
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
  }, [miniGamesData, countOnly]);

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

  // Create a combined refetch function that refetches both queries
  const refetch = useCallback(async () => {
    const promises: Promise<void>[] = [];

    if (miniGamesRefetch) {
      promises.push(miniGamesRefetch());
    }

    if ((isPaginationEnabled || fetchCount || countOnly) && refetchCount) {
      promises.push(refetchCount());
    }

    await Promise.all(promises);
  }, [miniGamesRefetch, refetchCount, isPaginationEnabled, fetchCount]);

  return {
    minigames: gameData,
    loading: isLoading,
    error,
    refetch, // Use the combined refetch
    pagination: paginationControls,
    totalCount,
  };
};
