import { getMetagameClient } from '../singleton';
import { useEntitySubscription } from '../dojo/hooks/useEntitySubscription';
import { gameScoresQuery } from '../queries/sdk';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';
import { gameScoresKeyQuery } from '../queries/sql';
import { useSqlQuery } from '../services/sqlService';

export interface UseSubscribeGameScoresParams {
  gameAddress: string;
  gameIds?: string[];
  enabled?: boolean;
  logging?: boolean;
}

export function useSubscribeGameScores(params: UseSubscribeGameScoresParams) {
  const client = getMetagameClient();
  const { gameAddress, gameIds, enabled = true, logging = false } = params;
  const { gameScoreModel, gameScoreAttribute, gameNamespace } = useGameEndpoints(gameAddress);

  const keyQuery =
    gameNamespace && gameScoreModel ? gameScoresKeyQuery(gameNamespace, gameScoreModel) : null;

  const { data: gameScoreKeyData } = useSqlQuery<{ name: string }>(
    client.getConfig().toriiUrl,
    keyQuery
  );

  const gameScoreKey = gameScoreKeyData?.[0]?.name || null;

  const missingConfig = !gameScoreModel || !gameScoreAttribute || !gameNamespace || !gameScoreKey;

  // let configError = null;
  // if (missingConfig) {
  //   const missingItems = [];
  //   if (!gameScoreModel) missingItems.push('Score Model');
  //   if (!gameScoreAttribute) missingItems.push('Score Attribute');
  //   if (!gameNamespace) missingItems.push('Namespace');
  //   if (!gameScoreKey) missingItems.push('Score Key');

  //   configError = new Error(`Missing required game configuration: ${missingItems.join(', ')}`);
  // }

  const scoreTransform = (entity: any) => {
    if (missingConfig) {
      return {
        entityId: entity.entityId,
        models: { score: 0, game_id: 0 },
      };
    }

    const { entityId, models } = entity;

    const namespaceModels = models[gameNamespace] || {};
    const gameModel = namespaceModels[gameScoreModel] || {};

    const score = gameModel[gameScoreAttribute] || 0;
    const game_id = gameModel[gameScoreKey] || 0;

    return {
      entityId,
      models: {
        [gameNamespace]: {
          score,
          game_id,
        },
      },
    };
  };

  const query = !missingConfig
    ? gameScoresQuery({
        gameNamespace,
        gameScoreModel,
        gameScoreKey,
        gameIds,
      })
    : null;

  return useEntitySubscription(client, {
    query,
    namespace: gameNamespace || '',
    enabled: enabled && !missingConfig,
    logging,
    transform: scoreTransform,
  });
}
