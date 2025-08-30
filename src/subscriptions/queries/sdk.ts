import { ToriiQueryBuilder, KeysClause } from '@dojoengine/sdk';
import { padAddress, padU64 } from '../../shared/lib';

interface GamesQueryParams {
  namespace: string;
  owner?: string;
  gameAddresses?: string[];
  tokenIds?: number[];
  settings_id?: number;
  completed_all_objectives?: boolean;
  soulbound?: boolean;
  minted_by?: string;
  limit?: number;
}

export const gamesQuery = ({
  namespace,
  owner,
  gameAddresses,
  tokenIds,
  settings_id,
  completed_all_objectives,
  soulbound,
  minted_by,
  limit = 10000,
}: GamesQueryParams) => {
  const models = [
    `${namespace}-OwnersUpdate` as const,
    `${namespace}-TokenMetadataUpdate` as const,
    `${namespace}-GameRegistryUpdate` as const,
    `${namespace}-TokenPlayerNameUpdate` as const,
    `${namespace}-TokenScoreUpdate` as const,
    `${namespace}-TokenContextUpdate` as const,
    `${namespace}-SettingsCreated` as const,
    `${namespace}-ObjectiveUpdate` as const,
    `${namespace}-ObjectiveCreated` as const,
    `${namespace}-TokenRendererUpdate` as const,
    `${namespace}-TokenClientUrlUpdate` as const,
    `${namespace}-GameMetadataUpdate` as const,
    `${namespace}-MinterRegistryUpdate` as const,
  ];

  let keysClause = KeysClause(models, []);

  // Apply filters using where clauses
  if (owner) {
    keysClause = keysClause.where(`${namespace}-OwnersUpdate`, 'owner', 'Eq', padAddress(owner));
  }

  if (tokenIds && tokenIds.length > 0) {
    keysClause = keysClause.where(
      `${namespace}-TokenMetadataUpdate`,
      'id',
      'In',
      tokenIds.map((id) => padU64(BigInt(id)))
    );
  }

  if (gameAddresses && gameAddresses.length > 0) {
    keysClause = keysClause.where(
      `${namespace}-GameRegistryUpdate`,
      'contract_address',
      'In',
      gameAddresses.map((addr) => padAddress(addr))
    );
  }

  if (settings_id !== undefined) {
    keysClause = keysClause.where(
      `${namespace}-TokenMetadataUpdate`,
      'settings_id',
      'Eq',
      settings_id
    );
  }

  if (completed_all_objectives !== undefined) {
    keysClause = keysClause.where(
      `${namespace}-TokenMetadataUpdate`,
      'completed_all_objectives',
      'Eq',
      completed_all_objectives
    );
  }

  if (soulbound !== undefined) {
    keysClause = keysClause.where(`${namespace}-TokenMetadataUpdate`, 'soulbound', 'Eq', soulbound);
  }

  if (minted_by !== undefined) {
    keysClause = keysClause.where(
      `${namespace}-TokenMetadataUpdate`,
      'minted_by',
      'Eq',
      Number(minted_by)
    );
  }

  return new ToriiQueryBuilder()
    .withClause(keysClause.build())
    .withEntityModels(models)
    .includeHashedKeys()
    .withLimit(limit);
};

export const miniGamesQuery = ({
  namespace,
  limit = 10000,
}: {
  namespace: string;
  limit?: number;
}) => {
  return new ToriiQueryBuilder()
    .withClause(KeysClause([`${namespace}-GameMetadataUpdate`], []).build())
    .withEntityModels([`${namespace}-GameMetadataUpdate`])
    .includeHashedKeys()
    .withLimit(limit);
};

export const settingsQuery = ({
  namespace,
  limit = 10000,
}: {
  namespace: string;
  limit?: number;
}) => {
  return new ToriiQueryBuilder()
    .withClause(
      KeysClause([`${namespace}-SettingsCreated`, `${namespace}-GameMetadataUpdate`], []).build()
    )
    .withEntityModels([`${namespace}-SettingsCreated`, `${namespace}-GameMetadataUpdate`])
    .includeHashedKeys()
    .withLimit(limit);
};

export const objectivesQuery = ({
  namespace,
  limit = 10000,
}: {
  namespace: string;
  limit?: number;
}) => {
  return new ToriiQueryBuilder()
    .withClause(
      KeysClause([`${namespace}-ObjectiveCreated`, `${namespace}-GameMetadataUpdate`], []).build()
    )
    .withEntityModels([`${namespace}-ObjectiveCreated`, `${namespace}-GameMetadataUpdate`])
    .includeHashedKeys()
    .withLimit(limit);
};
