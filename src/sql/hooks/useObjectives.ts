import { useMemo } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { gameSettingsQuery, objectivesQuery } from '../queries/sql';
import { getMetagameClient } from '../../shared/singleton';
import { parseSettingsData } from '../../shared/utils/dataTransformers';
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
  const client = getMetagameClient();

  const query = useMemo(
    () =>
      objectivesQuery({
        namespace: client.getNamespace(),
        gameAddresses,
        objectiveIds,
        limit,
        offset,
      }),
    [gameAddresses, objectiveIds, limit, offset]
  );

  const {
    data: rawObjectivesData,
    loading,
    error,
    refetch,
  } = useSqlQuery<GameObjective>(client.getConfig().toriiUrl, query, logging);

  const objectivesData = useMemo(() => {
    if (!rawObjectivesData || !rawObjectivesData.length) return [];

    return rawObjectivesData.map((objective: any) => {
      // Build gameMetadata object if available
      const gameMetadata = objective.game_id
        ? {
            game_id: Number(objective.game_id) || 0,
            contract_address: objective.contract_address || '',
            creator_token_id: Number(objective.creator_token_id) || 0,
            name: feltToString(objective.name) || '',
            description: objective.description || '',
            developer: feltToString(objective.developer) || '',
            publisher: feltToString(objective.publisher) || '',
            genre: feltToString(objective.genre) || '',
            image: objective.image || '',
            color: objective.color,
          }
        : undefined;

      return {
        objective_id: objective.objective_id?.toString() || '',
        data: objective.data || '',
        gameMetadata,
      };
    });
  }, [rawObjectivesData]);

  return { data: objectivesData, loading, error, refetch };
};
