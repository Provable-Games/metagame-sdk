import { getMetagameClient } from '../singleton';
import { useEntitySubscription } from '../dojo/hooks/useEntitySubscription';
import { gameScoresQuery } from '../queries/sdk';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';
import { gameScoresKeyQuery } from '../queries/sql';
import { useSqlQuery } from '../services/sqlService';
import { useMemo, useRef, useEffect } from 'react';
import { indexAddress } from '../lib';

export interface UseSubscribeTokensParams {
  gameAddress: string;
  gameIds?: string[];
  enabled?: boolean;
  logging?: boolean;
}

export function useSubscribeTokens(params: UseSubscribeTokensParams) {
  const client = getMetagameClient();
  const { gameAddress, gameIds, enabled = true, logging = false } = params;

  const toriiClient = client.getConfig().toriiClient;

  const gameAddressMemo = useMemo(() => gameAddress, [gameAddress]);

  const tokenSubscription = useRef<any>(null);

  useEffect(() => {
    if (!toriiClient || gameAddress === '0x0' || !enabled) return;

    tokenSubscription.current = toriiClient.onTokenUpdated(
      [indexAddress(gameAddress)],
      [],
      (token: any) => {
        if (token.contract_address !== '0x0') {
          console.log(token);
        }
      }
    );

    return () => {
      if (tokenSubscription.current) {
        tokenSubscription.current.cancel();
        tokenSubscription.current = null;
      }
    };
  }, [toriiClient, gameAddressMemo, enabled, logging]);
}
