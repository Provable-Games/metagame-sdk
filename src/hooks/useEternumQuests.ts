import { useMemo } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { getMetagameClient } from '../singleton';
import { eternumQuestQuery } from '../queries/sql';

interface EternumQuestQueryParams {
  eternumNamespace: string;
  questTileIds: string[];
  limit?: number;
  offset?: number;
}

interface EternumQuest {
  quest_tile_id: string;
  game_address: string;
  coord: {
    x: number;
    y: number;
  };
  level: number;
  resource_type: number;
  amount: bigint;
  capacity: number;
  participant_count: number;
}

export const useEternumQuests = ({
  eternumNamespace,
  questTileIds,
  limit = 100,
  offset = 0,
}: EternumQuestQueryParams): SqlQueryResult<EternumQuest> => {
  const client = getMetagameClient();
  const query = useMemo(
    () => eternumQuestQuery(eternumNamespace, questTileIds, limit, offset),
    [eternumNamespace, questTileIds, limit, offset]
  );
  const {
    data: rawData,
    loading,
    error,
    refetch,
  } = useSqlQuery<any>(client.getConfig().toriiUrl, query);

  const data = useMemo(() => {
    return rawData.map((item: any) => ({
      quest_tile_id: item.id,
      game_address: item.game_address,
      coord: {
        x: Number(item['coord.x']),
        y: Number(item['coord.y']),
      },
      level: item.level,
      resource_type: item.resource_type,
      amount: BigInt(item.amount),
      capacity: item.capacity,
      participant_count: item.participant_count,
    }));
  }, [rawData]);

  return { data, loading, error, refetch };
};
