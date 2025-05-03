import { getMetagameClient } from '../singleton';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';
import { KeysClause } from '@dojoengine/sdk';
import type { EntityKeysClause, Subscription } from '@dojoengine/torii-wasm';
import { GameScore, Score, TokenMetadata } from '../types/games';
import { useScoreStore } from '../store/scores';
import { useEffect, useRef } from 'react';
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
      [
        KeysClause(
          [`${gameNamespace}-${gameScoreModel}`, `${gameNamespace}-TokenMetadata`],
          []
        ).build() as EntityKeysClause,
      ],
      (entity: any, data: any) => {
        if (entity !== '0x0') {
          // Process TokenMetadata updates
          if (
            data[`${gameNamespace}-TokenMetadata`] &&
            data[`${gameNamespace}-TokenMetadata`].token_id &&
            data[`${gameNamespace}-TokenMetadata`].token_id.value
          ) {
            try {
              const tokenMetadata = formatTokenMetadata(gameNamespace, data);
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
          if (
            data[`${gameNamespace}-${gameScoreModel}`] &&
            data[`${gameNamespace}-${gameScoreModel}`].game_id &&
            data[`${gameNamespace}-${gameScoreModel}`].game_id.value
          ) {
            try {
              // Get token ID to match with existing metadata
              const tokenId = Number(data[`${gameNamespace}-${gameScoreModel}`].game_id.value);

              // Get the score value
              const scoreValue = !isNaN(
                Number(data[`${gameNamespace}-${gameScoreModel}`][gameScoreAttribute].value)
              )
                ? Number(data[`${gameNamespace}-${gameScoreModel}`][gameScoreAttribute].value)
                : 0;

              // Get the latest scores state from the store
              const currentScores = useScoreStore.getState().scores;

              // Find existing score in the latest store state
              const existingScore = currentScores[tokenId];

              if (existingScore) {
                // Update existing score with new score value
                const updatedScore = {
                  ...existingScore,
                  score: scoreValue,
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
  }, [toriiClient, gameNamespace, gameScoreModel, gameScoreAttribute, enabled, missingConfig]);

  return {
    scores,
  };
}
