import { gameRankingQuery, gameLeaderboardQuery } from '../queries/sql';
import { useSqlQuery } from '../services/sqlService';
import { useMemo } from 'react';
import { getMetagameClientSafe } from '../../shared/singleton';
import { feltToString } from '../../shared/lib';
import type { GameRankingData, GameLeaderboardEntry } from '../../shared/types';

// Unified ranking parameters
export interface UseGameTokenRankingParams {
  // Target token to rank (required)
  tokenId: number;
  mintedByAddress?: string;

  // Ranking scope filters (optional)
  gameAddress?: string;
  settings_id?: number;
  ownerFilter?: string;
  gameOver?: boolean;
}

export interface UseGameTokenRankingResult {
  ranking: GameRankingData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Single unified ranking hook
export const useGameTokenRanking = ({
  tokenId,
  mintedByAddress,
  gameAddress,
  settings_id,
  ownerFilter,
  gameOver,
}: UseGameTokenRankingParams): UseGameTokenRankingResult => {
  const client = getMetagameClientSafe();
  const toriiUrl = client?.getConfig().toriiUrl || '';

  const rankingQuery = useMemo(() => {
    if (!client) return null;

    return gameRankingQuery({
      namespace: client.getNamespace(),
      tokenId,
      mintedByAddress,
      gameAddress,
      settings_id,
      ownerFilter,
      gameOver,
    });
  }, [client, tokenId, mintedByAddress, gameAddress, settings_id, ownerFilter, gameOver]);

  const { data: rankingData, loading, error, refetch } = useSqlQuery(toriiUrl, rankingQuery, true);

  const ranking = useMemo(() => {
    if (!rankingData || !rankingData.length) return null;

    const rankResult = rankingData[0] as { rank: number; total_count: number; score: number };

    return {
      rank: Number(rankResult.rank) || 0,
      totalCount: Number(rankResult.total_count) || 0,
      score: Number(rankResult.score) || 0,
    };
  }, [rankingData]);

  return {
    ranking,
    loading,
    error,
    refetch,
  };
};

// Unified leaderboard parameters
export interface UseGameLeaderboardParams {
  // Target token to show leaderboard around (required)
  tokenId: number;
  mintedByAddress?: string;

  // Leaderboard scope filters (optional)
  gameAddress?: string;
  settings_id?: number;
  ownerFilter?: string;
  gameOver?: boolean;

  // Leaderboard range (optional)
  above?: number; // Number of games to show above current rank (default: 3)
  below?: number; // Number of games to show below current rank (default: 3)
}

export interface UseGameLeaderboardResult {
  leaderboard: GameLeaderboardEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Single unified leaderboard hook
export const useGameLeaderboard = ({
  tokenId,
  mintedByAddress,
  gameAddress,
  above = 3,
  below = 3,
  settings_id,
  ownerFilter,
  gameOver,
}: UseGameLeaderboardParams): UseGameLeaderboardResult => {
  const client = getMetagameClientSafe();
  const toriiUrl = client?.getConfig().toriiUrl || '';

  const leaderboardQuery = useMemo(() => {
    if (!client) return null;

    // Use leaderboard query (this will work with all filters)
    return gameLeaderboardQuery({
      namespace: client.getNamespace(),
      mintedByAddress: mintedByAddress || '', // Empty string will be handled in SQL
      tokenId,
      gameAddress,
      above,
      below,
      settings_id,
      ownerFilter,
      gameOver,
    });
  }, [client, tokenId, mintedByAddress, gameAddress, above, below, settings_id, ownerFilter, gameOver]);

  const {
    data: leaderboardData,
    loading,
    error,
    refetch,
  } = useSqlQuery(toriiUrl, leaderboardQuery, true);

  const leaderboard = useMemo(() => {
    if (!leaderboardData || !leaderboardData.length) return [];

    return (leaderboardData as Record<string, unknown>[]).map((entry) => ({
      rank: Number(entry.rank) || 0,
      tokenId: Number(entry.token_id) || 0,
      owner: String(entry.owner || ''),
      playerName: feltToString(entry.player_name as string) || undefined,
      mintedByAddress: String(entry.minted_by_address || ''),
      score: Number(entry.score) || 0,
      mintedAt: Number(entry.minted_at) || 0,
      isCurrentUser: Boolean(entry.is_current_user),
    })) as GameLeaderboardEntry[];
  }, [leaderboardData]);

  return {
    leaderboard,
    loading,
    error,
    refetch,
  };
};
