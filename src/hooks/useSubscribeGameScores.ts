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
  const gameEndpoints = useGameEndpoints([gameAddress]);
  const addressEndpoints = gameEndpoints?.[gameAddress];
  const { scoreModel, scoreAttribute, namespace } = addressEndpoints ?? {};
  const keyQuery = namespace && scoreModel ? gameScoresKeyQuery(namespace, scoreModel) : null;

  const { data: gameScoreKeyData } = useSqlQuery<{ name: string }>(
    client.getConfig().toriiUrl,
    keyQuery
  );

  const gameScoreKey = gameScoreKeyData?.[0]?.name || null;

  const missingConfig = !scoreModel || !scoreAttribute || !namespace || !gameScoreKey;

  let configError = null;
  if (missingConfig) {
    const missingItems = [];
    if (!scoreModel) missingItems.push('Score Model');
    if (!scoreAttribute) missingItems.push('Score Attribute');
    if (!namespace) missingItems.push('Namespace');
    if (!gameScoreKey) missingItems.push('Score Key');

    configError = new Error(`Missing required game configuration: ${missingItems.join(', ')}`);
  }

  const scoreTransform = (entity: any) => {
    if (missingConfig) {
      return {
        entityId: entity.entityId,
        models: { score: 0, game_id: 0 },
      };
    }

    const { entityId, models } = entity;

    const namespaceModels = models[namespace] || {};
    const gameModel = namespaceModels[scoreModel] || {};

    const score = gameModel[scoreAttribute] || 0;
    const game_id = gameModel[gameScoreKey] || 0;

    return {
      entityId,
      models: {
        [namespace]: {
          score,
          game_id,
        },
      },
    };
  };

  const query = !missingConfig
    ? gameScoresQuery({
        gameNamespace: namespace,
        gameScoreModel: scoreModel,
        gameScoreKey: gameScoreKey,
        gameIds,
      })
    : null;

  return useEntitySubscription(client, {
    query,
    namespace: namespace || '',
    enabled: enabled && !missingConfig,
    logging,
    transform: scoreTransform,
  });
}
