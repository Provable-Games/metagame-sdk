import { getMetagameClient } from '../singleton';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';
import { KeysClause } from '@dojoengine/sdk';
import type { EntityKeysClause, Subscription } from '@dojoengine/torii-wasm';
import { Score } from '../types/games';
import { useScoreStore } from '../store/scores';
import { useEffect, useRef } from 'react';

export interface UseSubscribeScoresParams {
  gameAddress: string;
  gameIds?: string[];
  enabled?: boolean;
  logging?: boolean;
  onScoreUpdate?: (score: Score) => void;
}

export function useSubscribeScores(params: UseSubscribeScoresParams) {
  const client = getMetagameClient();
  const { scores, setScore } = useScoreStore();
  const { gameAddress, gameIds, enabled = true, logging = false, onScoreUpdate } = params;
  const { gameScoreModel, gameScoreAttribute, gameNamespace } = useGameEndpoints(gameAddress);
  const gameScoreSubscription = useRef<Subscription | null>(null);

  const toriiClient = client.getConfig().toriiClient;

  const missingConfig = !gameScoreModel || !gameScoreAttribute || !gameNamespace;

  let configError = null;
  if (missingConfig) {
    const missingItems = [];
    if (!gameScoreModel) missingItems.push('Score Model');
    if (!gameScoreAttribute) missingItems.push('Score Attribute');
    if (!gameNamespace) missingItems.push('Namespace');

    configError = new Error(`Missing required game configuration: ${missingItems.join(', ')}`);
  }

  useEffect(() => {
    if (!toriiClient || missingConfig || !enabled) return;

    gameScoreSubscription.current = toriiClient.onEntityUpdated(
      [KeysClause([`${gameNamespace}-${gameScoreModel}`], []).build() as EntityKeysClause],
      (entity: any, data: any) => {
        if (entity !== '0x0') {
          if (logging) {
            console.log(entity, data);
          }
          const score = formatScore(data);
          setScore(score);
          onScoreUpdate?.(score);
        }
      }
    );

    return () => {
      if (gameScoreSubscription.current) {
        gameScoreSubscription.current.cancel();
        gameScoreSubscription.current = null;
      }
    };
  }, [toriiClient, gameNamespace, gameScoreModel, gameScoreAttribute, enabled, missingConfig]);

  const formatScore = (data: any): Score => {
    if (missingConfig) {
      return {
        game_id: 0,
        score: 0,
      };
    }

    return {
      game_id: Number(data[`${gameNamespace}-${gameScoreModel}`].game_id.value),
      score: Number(data[`${gameNamespace}-${gameScoreModel}`][gameScoreAttribute].value),
    };
  };

  return {
    scores,
  };
}
