import { miniGamesCountQuery } from '../queries/sql';
import { useSqlQuery } from '../services/sqlService';
import { useMemo } from 'react';
import { getMetagameClientSafe } from '../../shared/singleton';

interface UseMiniGamesCountParams {
  gameAddresses?: string[];
}

export interface UseMiniGamesCountResult {
  count: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMiniGamesCount = ({
  gameAddresses,
}: UseMiniGamesCountParams): UseMiniGamesCountResult => {
  const client = getMetagameClientSafe();
  const toriiUrl = client?.getConfig().toriiUrl || '';

  const query = useMemo(() => {
    if (!client) return null;
    return miniGamesCountQuery({
      namespace: client.getNamespace(),
      gameAddresses,
    });
  }, [client, gameAddresses]);

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