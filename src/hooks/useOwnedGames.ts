import { useMemo } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { ownedGamesQuery } from '../queries/sql';
import { getMetagameClient } from '../singleton';
import { indexAddress } from '../lib';

interface UseOwnedGameProps {
  address: string;
  gameAddresses: string[];
  metagame?: {
    namespace: string;
    model: string;
    attribute: string;
    key: string;
  };
  limit?: number;
  offset?: number;
  logging?: boolean;
}

interface OwnedGame {
  contract_address: string;
  account_address: string;
  token_id: string;
  metadata: string;
}

export const useOwnedGames = ({
  address,
  gameAddresses,
  metagame,
  limit = 100,
  offset = 0,
  logging = false,
}: UseOwnedGameProps): SqlQueryResult<OwnedGame> => {
  const client = getMetagameClient();
  const gameAddressesKey = useMemo(() => JSON.stringify(gameAddresses), [gameAddresses]);
  const query = useMemo(
    () =>
      ownedGamesQuery(
        indexAddress(address),
        gameAddresses.map(indexAddress),
        metagame,
        limit,
        offset
      ),
    [address, gameAddressesKey, metagame, limit, offset]
  );
  const { data, loading, error, refetch } = useSqlQuery<OwnedGame>(
    client.getConfig().toriiUrl,
    query,
    logging
  );
  return { data, loading, error, refetch };
};
