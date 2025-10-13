import { gameSettingsCountQuery } from '../queries/sql';
import { useSqlQuery } from '../services/sqlService';
import { useMemo } from 'react';
import { getMetagameClientSafe } from '../../shared/singleton';

interface UseSettingsCountParams {
  gameAddresses?: string[];
  settingsIds?: number[];
}

export interface UseSettingsCountResult {
  count: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSettingsCount = ({
  gameAddresses,
  settingsIds,
}: UseSettingsCountParams): UseSettingsCountResult => {
  const client = getMetagameClientSafe();
  const toriiUrl = client?.getConfig().toriiUrl || '';

  const query = useMemo(() => {
    if (!client) return null;
    return gameSettingsCountQuery({
      namespace: client.getNamespace(),
      gameAddresses,
      settingsIds,
    });
  }, [client, gameAddresses, settingsIds]);

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