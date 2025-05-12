import { getMetagameClient } from '../singleton';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';
import { KeysClause } from '@dojoengine/sdk';
import type { Subscription } from '@dojoengine/torii-wasm';
import { GameScore, TokenMetadata } from '../types/games';
import { useScoreStore } from '../store/scores';
import { useEffect, useMemo, useRef } from 'react';
import { feltToString } from '../lib';

export interface UseSubscribeScoresParams {
  gameAddress: string;
  gameIds?: string[];
  enabled?: boolean;
  logging?: boolean;
  onScoreUpdate?: (score: GameScore) => void;
}

const formatTokenMetadata = (gameNamespace: string, data: any): TokenMetadata => {
  try {
    const result = {
      start: !isNaN(
        Number(data[`${gameNamespace}-TokenMetadata`].lifecycle.value.start.value.value.value)
      )
        ? Number(data[`${gameNamespace}-TokenMetadata`].lifecycle.value.start.value.value.value)
        : 0,
      end: !isNaN(
        Number(data[`${gameNamespace}-TokenMetadata`].lifecycle.value.end.value.value.value)
      )
        ? Number(data[`${gameNamespace}-TokenMetadata`].lifecycle.value.end.value.value.value)
        : 0,
      minted: !isNaN(Number(data[`${gameNamespace}-TokenMetadata`].lifecycle.value.mint.value))
        ? Number(data[`${gameNamespace}-TokenMetadata`].lifecycle.value.mint.value)
        : 0,
      minted_by: data[`${gameNamespace}-TokenMetadata`].minted_by.value ?? '',
      player_name: feltToString(data[`${gameNamespace}-TokenMetadata`].player_name.value) ?? '',
      settings_id: !isNaN(Number(data[`${gameNamespace}-TokenMetadata`].settings_id.value))
        ? Number(data[`${gameNamespace}-TokenMetadata`].settings_id.value)
        : 0,
      token_id: !isNaN(Number(data[`${gameNamespace}-TokenMetadata`].token_id.value))
        ? Number(data[`${gameNamespace}-TokenMetadata`].token_id.value)
        : 0,
    };
    return result;
  } catch (error) {
    console.error('Error in formatTokenMetadata:', error);
    return {
      start: 0,
      end: 0,
      minted: 0,
      minted_by: '',
      player_name: '',
      settings_id: 0,
      token_id: 0,
    };
  }
};

export function useSubscribeScores(params: UseSubscribeScoresParams) {
  const client = getMetagameClient();
  const { scores, setScore } = useScoreStore();
  const { gameAddress, gameIds, enabled = true, logging = false, onScoreUpdate } = params;
  const gameEndpoints = useGameEndpoints([gameAddress]);
  const addressEndpoints = gameEndpoints?.[gameAddress];
  const { scoreModel, scoreAttribute, namespace } = addressEndpoints ?? {};

  const gameScoreSubscription = useRef<Subscription | null>(null);

  const toriiClient = client.getConfig().toriiClient;

  const missingConfig = !gameEndpoints || !gameEndpoints[gameAddress];

  let configError = null;
  if (missingConfig) {
    const missingItems = [];
    if (!scoreModel) missingItems.push('Score Model');
    if (!scoreAttribute) missingItems.push('Score Attribute');
    if (!namespace) missingItems.push('Namespace');

    configError = new Error(`Missing required game configuration: ${missingItems.join(', ')}`);
  }

  useEffect(() => {
    if (!toriiClient || missingConfig || !enabled) return;

    gameScoreSubscription.current = toriiClient.onEntityUpdated(
      KeysClause([`${namespace}-${scoreModel}`, `${namespace}-TokenMetadata`], []).build(),
      (entity: any, data: any) => {
        if (entity !== '0x0') {
          // Process TokenMetadata updates

          const models = data.models;
          const tokenMetadataData = models[`${namespace}-TokenMetadata`];
          const scoreModelData = models[`${namespace}-${scoreModel}`];

          if (tokenMetadataData && tokenMetadataData.token_id && tokenMetadataData.token_id.value) {
            try {
              const tokenMetadata = formatTokenMetadata(namespace ?? '', models);
              const score = {
                ...tokenMetadata,
                score: 0,
              };
              setScore(score);
              onScoreUpdate?.(score);
            } catch (error) {
              console.error('Error getting or handling tokenMetadata:', error);
            }
          }

          // Process Score updates
          if (scoreModelData && scoreModelData.game_id && scoreModelData.game_id.value) {
            try {
              // Get token ID to match with existing metadata
              const tokenId = Number(scoreModelData.game_id.value);

              // Get the score value
              const scoreValue = (() => {
                if (!scoreAttribute) return 0;

                if (!scoreModelData || !scoreModelData[scoreAttribute]) return 0;

                const value = Number(scoreModelData[scoreAttribute].value);
                return !isNaN(value) ? value : 0;
              })();

              // Get the health from the namespace
              const healthValue = (() => {
                if (namespace === 'ds_v1_2_0') {
                  const health = scoreModelData.hero_health.value;
                  return !isNaN(Number(health)) ? Number(health) : 0;
                }
                if (namespace === 'ls_0_0_1') {
                  const health = scoreModelData.health.value;
                  return !isNaN(Number(health)) ? Number(health) : 0;
                }
                return 0;
              })();

              // Get the latest scores state from the store
              const currentScores = useScoreStore.getState().scores;

              // Find existing score in the latest store state
              const existingScore = currentScores[tokenId];

              if (existingScore) {
                // Update existing score with new score value
                const updatedScore = {
                  ...existingScore,
                  score: scoreValue,
                  health: healthValue,
                };

                // Set in store and call callback
                setScore(updatedScore);
                onScoreUpdate?.(updatedScore);
              } else {
                console.log(`Score received for token ID ${tokenId}, but no metadata found yet`);
              }
            } catch (error) {
              console.error('Error handling game score:', error);
            }
          }
        }
      }
    );

    return () => {
      if (gameScoreSubscription.current) {
        gameScoreSubscription.current.cancel();
        gameScoreSubscription.current = null;
      }
    };
  }, [toriiClient, namespace, scoreModel, scoreAttribute, enabled, missingConfig]);

  return {
    scores,
  };
}
