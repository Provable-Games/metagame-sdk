import { ToriiQueryBuilder, KeysClause } from '@dojoengine/sdk';

export const gamesQuery = ({ namespace }: { namespace: string }) => {
  return new ToriiQueryBuilder()
    .withClause(
      KeysClause(
        [
          `${namespace}-Owners`,
          `${namespace}-TokenMetadataUpdate`,
          `${namespace}-GameIdMappingUpdate`,
          `${namespace}-PlayerNameUpdate`,
          `${namespace}-ScoreUpdate`,
          `${namespace}-ContextUpdated`,
          `${namespace}-SettingsCreated`,
          `${namespace}-ObjectiveUpdate`,
          `${namespace}-ObjectiveCreated`,
          `${namespace}-TokenRendererUpdate`,
          `${namespace}-ClientUrlUpdate`,
          `${namespace}-GameMetadataUpdate`,
          `${namespace}-MinterAdded`,
        ],
        []
      ).build()
    )
    .withEntityModels([
      `${namespace}-Owners`,
      `${namespace}-TokenMetadataUpdate`,
      `${namespace}-GameIdMappingUpdate`,
      `${namespace}-PlayerNameUpdate`,
      `${namespace}-ScoreUpdate`,
      `${namespace}-ContextUpdated`,
      `${namespace}-SettingsCreated`,
      `${namespace}-ObjectiveUpdate`,
      `${namespace}-ObjectiveCreated`,
      `${namespace}-TokenRendererUpdate`,
      `${namespace}-ClientUrlUpdate`,
      `${namespace}-GameMetadataUpdate`,
      `${namespace}-MinterAdded`,
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
