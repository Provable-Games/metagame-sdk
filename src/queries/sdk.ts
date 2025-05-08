import { ToriiQueryBuilder, KeysClause, AndComposeClause, MemberClause } from '@dojoengine/sdk';

export const gameScoresQuery = ({
  gameNamespace,
  gameScoreModel,
  gameScoreKey,
  gameIds,
  limit = 100,
  offset = 0,
}: {
  gameNamespace: string;
  gameScoreModel: string;
  gameScoreKey: string;
  gameIds?: string[];
  limit?: number;
  offset?: number;
}) => {
  return gameIds
    ? new ToriiQueryBuilder()
        .withClause(
          AndComposeClause([
            KeysClause([`${gameNamespace}-${gameScoreModel}`], []),
            MemberClause(`${gameNamespace}-${gameScoreModel}`, gameScoreKey, 'In', gameIds),
          ]).build()
        )
        .withEntityModels([`${gameNamespace}-${gameScoreModel}`])
        .withLimit(limit)
        .includeHashedKeys()
    : new ToriiQueryBuilder()
        .withClause(KeysClause([`${gameNamespace}-${gameScoreModel}`], []).build())
        .withEntityModels([`${gameNamespace}-${gameScoreModel}`])
        .withLimit(limit)
        .includeHashedKeys();
};
