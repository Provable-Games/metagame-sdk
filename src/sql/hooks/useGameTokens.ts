import { gamesQuery, gamesCountQuery } from '../queries/sql';
import { tokenMetadataQuery, createTokenMetadataMap } from '../queries/tokenMetadata';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { feltToString } from '../../shared/lib';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { getMetagameClientSafe } from '../../shared/singleton';
import { parseSettingsData, parseContextData } from '../../shared/utils/dataTransformers';
import type { GameTokenData } from '../../shared/types';

interface GameTokensQueryParams {
  owner?: string;
  gameAddresses?: string[];
  tokenIds?: number[];
  hasContext?: boolean;
  context?: {
    name?: string;
    attributes?: Record<string, string>; // Filter by specific attributes within contexts object
  };
  settings_id?: number;
  completed_all_objectives?: boolean;
  soulbound?: boolean;
  objective_id?: string;
  mintedByAddress?: string;
  gameOver?: boolean;
  score?: {
    min?: number;
    max?: number;
    exact?: number;
  };
  limit?: number;
  offset?: number;
  // Sorting parameters
  sortBy?: 'score' | 'minted_at' | 'player_name' | 'token_id' | 'game_over' | 'owner' | 'game_id';
  sortOrder?: 'asc' | 'desc';

  // Pagination parameters
  pagination?: {
    pageSize?: number; // Number of items per page (default: 100)
    initialPage?: number; // Starting page (0-indexed, default: 0)
  };
  // Include token metadata from tokens table (default: true)
  includeMetadata?: boolean;
  // Fetch total count even when pagination is disabled (default: false)
  fetchCount?: boolean;
  // Only fetch count, skip main data query (default: false)
  countOnly?: boolean;
}

export interface PaginationControls {
  currentPage: number; // Current page (0-indexed)
  pageSize: number; // Items per page
  totalCount: number; // Total number of items across all pages
  totalPages: number; // Total number of pages
  hasNextPage: boolean; // Whether there's a next page
  hasPreviousPage: boolean; // Whether there's a previous page
  goToPage: (page: number) => void; // Navigate to specific page
  nextPage: () => void; // Go to next page
  previousPage: () => void; // Go to previous page
  firstPage: () => void; // Go to first page
  lastPage: () => void; // Go to last page
}

export interface UseGameTokensResult extends Omit<SqlQueryResult<GameTokenData>, 'data'> {
  // Renamed data to games
  games: GameTokenData[];
  // Pagination controls
  pagination: PaginationControls;
  // Metadata loading state
  metadataLoading?: boolean;
  // Total count of games (only available when pagination is enabled or explicitly requested)
  totalCount?: number;
}

export const useGameTokens = ({
  owner,
  gameAddresses,
  tokenIds,
  hasContext,
  context,
  settings_id,
  completed_all_objectives,
  soulbound,
  objective_id,
  mintedByAddress,
  gameOver,
  score,
  limit,
  offset = 0,
  sortBy = 'minted_at',
  sortOrder,
  pagination,
  includeMetadata = true,
  fetchCount = false,
  countOnly = false,
}: GameTokensQueryParams): UseGameTokensResult => {
  const client = getMetagameClientSafe();
  const toriiUrl = client?.getConfig().toriiUrl || '';

  // State for progressive metadata loading
  const [tokenMetadataMap, setTokenMetadataMap] = useState<Map<string, any>>(new Map());
  const [metadataLoading, setMetadataLoading] = useState(false);

  // Pagination state
  const isPaginationEnabled = !!pagination;
  const pageSize = pagination?.pageSize ?? 100;
  const [currentPage, setCurrentPage] = useState(pagination?.initialPage ?? 0);

  const defaultSortOrder = sortBy === 'score' || sortBy === 'minted_at' ? 'desc' : 'asc';
  const finalSortOrder = sortOrder ?? defaultSortOrder;

  const query = useMemo(() => {
    if (!client || countOnly) return null;
    return gamesQuery({
      namespace: client.getNamespace(),
      owner,
      gameAddresses,
      tokenIds,
      hasContext,
      context,
      settings_id,
      completed_all_objectives,
      soulbound,
      objective_id,
      mintedByAddress,
      gameOver,
      score,
      limit: isPaginationEnabled ? pageSize : limit,
      offset: isPaginationEnabled ? currentPage * pageSize : offset,
      sortBy,
      sortOrder: finalSortOrder,
    });
  }, [
    client,
    countOnly,
    owner,
    gameAddresses,
    tokenIds,
    hasContext,
    context,
    settings_id,
    completed_all_objectives,
    soulbound,
    objective_id,
    mintedByAddress,
    gameOver,
    score,
    isPaginationEnabled,
    pageSize,
    currentPage,
    limit,
    offset,
    sortBy,
    finalSortOrder,
  ]);

  const countQuery = useMemo(() => {
    if (!client || (!isPaginationEnabled && !fetchCount && !countOnly)) return null;
    return gamesCountQuery({
      namespace: client.getNamespace(),
      owner,
      gameAddresses,
      tokenIds,
      hasContext,
      context,
      settings_id,
      completed_all_objectives,
      soulbound,
      objective_id,
      mintedByAddress,
      gameOver,
      score,
    });
  }, [
    client,
    isPaginationEnabled,
    fetchCount,
    countOnly,
    owner,
    gameAddresses,
    tokenIds,
    hasContext,
    context,
    settings_id,
    completed_all_objectives,
    soulbound,
    objective_id,
    mintedByAddress,
    gameOver,
    score,
  ]);

  const {
    data: rawGameData,
    loading,
    error: queryError,
    refetch: refetchMain,
  } = useSqlQuery(toriiUrl, query, true);

  const {
    data: countData,
    loading: countLoading,
    error: countError,
    refetch: refetchCount,
  } = useSqlQuery(toriiUrl, countQuery, true);

  const error = queryError || countError;
  const isLoading = loading || countLoading;

  const totalCount = useMemo(() => {
    if (!isPaginationEnabled && !fetchCount && !countOnly) return undefined;
    if (!countData || !countData.length) return 0;
    return Number((countData[0] as any).count) || 0;
  }, [isPaginationEnabled, fetchCount, countOnly, countData]);

  const totalPages = isPaginationEnabled && totalCount !== undefined ? Math.ceil(totalCount / pageSize) : 1;

  // Extract unique token IDs when game data changes
  const tokenIdsToFetch = useMemo(() => {
    if (!rawGameData || !rawGameData.length || !includeMetadata || countOnly) return [];
    const uniqueIds = new Set<number>();
    rawGameData.forEach((game: any) => {
      if (game.token_id) {
        uniqueIds.add(Number(game.token_id));
      }
    });
    return Array.from(uniqueIds);
  }, [rawGameData, includeMetadata, countOnly]);

  // Fetch metadata progressively after main data loads
  useEffect(() => {
    if (tokenIdsToFetch.length === 0 || !toriiUrl) {
      return;
    }

    const fetchMetadata = async () => {
      setMetadataLoading(true);
      try {
        const query = tokenMetadataQuery(tokenIdsToFetch);

        const encodedQuery = encodeURIComponent(query);
        const fullUrl = `${toriiUrl}/sql?query=${encodedQuery}`;
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const map = createTokenMetadataMap(Array.isArray(data) ? data : []);
          setTokenMetadataMap(map);
        }
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenIdsToFetch, toriiUrl]);

  const gameScores = useMemo(() => {
    if (!rawGameData || !rawGameData.length || countOnly) return [];

    return rawGameData.map((game: any) => {
      // Parse context data if available
      const parsedContext = game.context ? parseContextData(game.context) : undefined;

      // Parse settings data if available
      const parsedSettings = game.settings_data ? parseSettingsData(game.settings_data) : undefined;

      // Build gameMetadata object if GameMetadata fields are available
      const gameMetadata = game.game_metadata_id
        ? {
            game_id: Number(game.game_metadata_id) || 0,
            contract_address: game.game_metadata_contract_address || '',
            name: game.game_metadata_name || '',
            description: game.game_metadata_description || '',
            developer: game.game_metadata_developer || '',
            publisher: game.game_metadata_publisher || '',
            genre: game.game_metadata_genre || '',
            image: game.game_metadata_image || '',
            color: game.game_metadata_color,
            client_url: game.game_metadata_client_url,
            renderer_address: game.game_metadata_renderer_address,
          }
        : undefined;

      const filteredGame: GameTokenData = {
        game_id: Number(game.game_id),
        game_over: game.game_over,
        lifecycle: {
          start: Number(game.lifecycle_start) || undefined,
          end: Number(game.lifecycle_end) || undefined,
        },
        minted_at: Number(game.minted_at) || undefined,
        minted_by: Number(game.minted_by) || undefined,
        minted_by_address: game.minted_by_address,
        owner: game.owner,
        settings_id: game.settings_id == null ? undefined : Number(game.settings_id),
        soulbound: Boolean(game.soulbound),
        completed_all_objectives: Boolean(game.completed_all_objectives),
        token_id: Number(game.token_id) || 0,
        player_name: feltToString(game.player_name) || undefined,
        metadata: includeMetadata
          ? (() => {
              // Convert hex token_id to decimal string for map lookup
              let tokenIdKey = '0';
              if (game.token_id) {
                if (typeof game.token_id === 'string' && game.token_id.startsWith('0x')) {
                  // Convert hex string to decimal
                  tokenIdKey = parseInt(game.token_id, 16).toString();
                } else {
                  tokenIdKey = game.token_id.toString();
                }
              }

              const metadata = tokenMetadataMap.get(tokenIdKey);
              return metadata;
            })()
          : undefined,
        context: parsedContext
          ? {
              name: parsedContext.name,
              description: parsedContext.description,
              contexts: parsedContext.contexts,
            }
          : undefined,
        settings: parsedSettings
          ? {
              name: parsedSettings.name,
              description: parsedSettings.description,
              data: parsedSettings.data,
            }
          : undefined,
        score: Number(game.score) || 0,
        objective_ids: game.objective_ids
          ? game.objective_ids
              .split(',')
              .map((id: string) => id.toString())
              .filter((id: string) => id && id.trim() !== '' && id !== '0')
          : [],
        renderer: game.renderer,
        client_url: game.client_url,
        gameMetadata,
      };
      return filteredGame;
    });
  }, [rawGameData, tokenMetadataMap, includeMetadata, countOnly]);

  const hasNextPage = isPaginationEnabled ? currentPage < totalPages - 1 : false;
  const hasPreviousPage = isPaginationEnabled ? currentPage > 0 : false;

  // Pagination control functions
  const goToPage = useCallback(
    (page: number) => {
      const clampedPage = Math.max(0, Math.min(page, totalPages - 1));
      setCurrentPage(clampedPage);
      // Clear metadata map when changing pages
      setTokenMetadataMap(new Map());
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      setTokenMetadataMap(new Map());
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
      setTokenMetadataMap(new Map());
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(0);
    setTokenMetadataMap(new Map());
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(Math.max(0, totalPages - 1));
    setTokenMetadataMap(new Map());
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

    // Clear metadata to trigger re-fetch
    setTokenMetadataMap(new Map());

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
    games: gameScores,
    loading: isLoading,
    error,
    refetch, // Use the combined refetch
    pagination: paginationControls,
    metadataLoading,
    totalCount,
  };
};
