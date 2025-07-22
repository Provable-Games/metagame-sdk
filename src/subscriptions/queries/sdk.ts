import { ToriiQueryBuilder, KeysClause } from '@dojoengine/sdk';

export const gamesQuery = ({ namespace }: { namespace: string }) => {
  return new ToriiQueryBuilder()
    .withClause(
      KeysClause(
        [
          `${namespace}-OwnersUpdate`,
          `${namespace}-TokenMetadataUpdate`,
          `${namespace}-GameRegistryUpdate`,
          `${namespace}-TokenPlayerNameUpdate`,
          `${namespace}-TokenScoreUpdate`,
          `${namespace}-TokenContextUpdate`,
          `${namespace}-SettingsCreated`,
          `${namespace}-ObjectiveUpdate`,
          `${namespace}-ObjectiveCreated`,
          `${namespace}-TokenRendererUpdate`,
          `${namespace}-TokenClientUrlUpdate`,
          `${namespace}-GameMetadataUpdate`,
          `${namespace}-MinterRegistryUpdate`,
        ],
        []
      ).build()
    )
    .withEntityModels([
      `${namespace}-OwnersUpdate`,
      `${namespace}-TokenMetadataUpdate`,
      `${namespace}-GameRegistryUpdate`,
      `${namespace}-TokenPlayerNameUpdate`,
      `${namespace}-TokenScoreUpdate`,
      `${namespace}-TokenContextUpdate`,
      `${namespace}-SettingsCreated`,
      `${namespace}-ObjectiveUpdate`,
      `${namespace}-ObjectiveCreated`,
      `${namespace}-TokenRendererUpdate`,
      `${namespace}-TokenClientUrlUpdate`,
      `${namespace}-GameMetadataUpdate`,
      `${namespace}-MinterRegistryUpdate`,
    ])
    .includeHashedKeys()
    .withLimit(10000);
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
