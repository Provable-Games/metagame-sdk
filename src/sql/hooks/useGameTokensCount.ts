import { gamesCountQuery } from '../queries/sql';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { useMemo } from 'react';
import { getMetagameClientSafe } from '../../shared/singleton';

interface GameTokensCountParams {
  owner?: string;
  gameAddresses?: string[];
  tokenIds?: number[];
  hasContext?: boolean;
  context?: {
    id?: number;
    name?: string;
    attributes?: Record<string, string>;
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
  // Lifecycle filters
  started?: boolean;
  expired?: boolean;
  playerName?: string;
}

export interface UseGameTokensCountResult {
  count: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useGameTokensCount = ({
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
  started,
  expired,
  playerName,
}: GameTokensCountParams): UseGameTokensCountResult => {
  const client = getMetagameClientSafe();
  const toriiUrl = client?.getConfig().toriiUrl || '';

  const query = useMemo(() => {
    if (!client) return null;
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
      started,
      expired,
      playerName,
    });
  }, [
    client,
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
    started,
    expired,
    playerName,
  ]);

  const {
    data: countData,
    loading,
    error,
    refetch,
  } = useSqlQuery(toriiUrl, query, true);

  const count = useMemo(() => {
    if (!countData || !countData.length) return 0;
    return Number((countData[0] as any).count) || 0;
  }, [countData]);

  return {
    count,
    loading,
    error,
    refetch,
  };
};