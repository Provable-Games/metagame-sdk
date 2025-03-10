import { ToriiQueryBuilder, KeysClause } from '@dojoengine/sdk';

export const miniGamesDataQuery = ({ gameNamespace }: { gameNamespace: string }) => {
  const query = new ToriiQueryBuilder()
    .withClause(KeysClause([`${gameNamespace}-Game`, `${gameNamespace}-TokenMetadata`], []).build())
    .withEntityModels([`${gameNamespace}-Game`, `${gameNamespace}-TokenMetadata`])
    .includeHashedKeys();

  return { query };
};
