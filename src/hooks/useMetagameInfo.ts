import { useMemo } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { getMetagameClient } from '../singleton';
import { metagameInfoQuery } from '../queries/sql';

interface MetagameInfoQueryParams {
  metagameAddress: string;
  gameIds?: string[];
  limit?: number;
  offset?: number;
}

interface MetagameInfo {
  score: number;
  player_name: string;
  token_id: string;
  metadata: string;
  minted: number;
  start: number;
  end: number;
}

export const useMetagameInfo = ({
  metagameAddress,
  gameIds,
  limit = 100,
  offset = 0,
}: MetagameInfoQueryParams): SqlQueryResult<MetagameInfo> => {
  const client = getMetagameClient();
  const query = useMemo(
    () =>
      metagameInfoQuery('eternum', 'Quest', 'details_id', 'game_token_id', gameIds, limit, offset),
    [metagameAddress, gameIds, limit, offset]
  );
  const { data, loading, error, refetch } = useSqlQuery<MetagameInfo>(
    client.getConfig().toriiUrl,
    query
  );
  return { data, loading, error, refetch };
};
