import { SchemaType } from '@dojoengine/sdk';
import { MetagameClient } from '../client';
import { useEntitySubscription } from '../dojo/hooks/useEntitySubscription';
import { miniGamesDataQuery } from '../queries/sdk';

export interface UseSubscribeMiniGameOptions {
  gameNamespace: string;
  enabled?: boolean;
  logging?: boolean;
}

export function useSubscribeMiniGame<S extends SchemaType, T = any>(
  client: MetagameClient<S>,
  options: UseSubscribeMiniGameOptions
) {
  const { gameNamespace, enabled, logging } = options;

  return useEntitySubscription<S, T>(client, {
    query: miniGamesDataQuery({ gameNamespace }).query,
    namespace: gameNamespace,
    enabled,
    logging,
  });
}
