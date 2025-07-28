import { useMemo } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { objectivesQuery } from '../queries/sql';
import { getMetagameClientSafe } from '../../shared/singleton';
import { feltToString } from '../../shared/lib';
import type { GameObjective } from '../../shared/types';

interface UseGameObjectivesProps {
  gameAddresses?: string[];
  objectiveIds?: number[];
  limit?: number;
  offset?: number;
  logging?: boolean;
}

export const useObjectives = ({
  gameAddresses,
  objectiveIds,
  limit = 100,
  offset = 0,
  logging = false,
}: UseGameObjectivesProps): SqlQueryResult<GameObjective> => {
  const client = getMetagameClientSafe();

  const query = useMemo(() => {
    if (!client) return null;
    return objectivesQuery({
      namespace: client.getNamespace(),
      gameAddresses,
      objectiveIds,
      limit,
      offset,
    });
  }, [client, gameAddresses, objectiveIds, limit, offset]);

  const {
    data: rawObjectivesData,
    loading,
    error,
    refetch,
  } = useSqlQuery<GameObjective>(client?.getConfig().toriiUrl || '', query, logging);

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

  return { data: objectivesData, loading, error, refetch };
};
