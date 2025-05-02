import { indexAddress } from '@metagame-sdk/core';
import { useMemo } from 'react';
import { KeysClause } from '@dojoengine/sdk';
import type { EntityKeysClause } from '@dojoengine/torii-wasm';

export interface UseSubscribeScoresParams {
  gameAddress: string;
  gameIds?: string[];
  enabled?: boolean;
  logging?: boolean;
}

export function useSubscribeScores(params: UseSubscribeScoresParams) {
  const { gameAddress, gameIds, enabled = true, logging = false } = params;

  const gameAddressMemo = useMemo(() => gameAddress, [gameAddress]);

  // Implementation will be added later
  return {
    gameAddress: gameAddressMemo,
  };
}
