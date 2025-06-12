import { ToriiQueryBuilder, KeysClause } from '@dojoengine/sdk';

export const gamesQuery = ({ namespace }: { namespace: string }) => {
  return new ToriiQueryBuilder()
    .withClause(
      KeysClause(
        [
          `${namespace}-Owners`,
          `${namespace}-TokenMetadata`,
          `${namespace}-GameRegistry`,
          `${namespace}-TokenPlayerName`,
          `${namespace}-ScoreUpdate`,
          `${namespace}-TokenContextData`,
          `${namespace}-SettingsData`,
          `${namespace}-TokenObjective`,
          `${namespace}-ObjectiveData`,
          `${namespace}-TokenRenderer`,
          `${namespace}-TokenClientUrl`,
          `${namespace}-GameMetadata`,
          `${namespace}-MinterRegistryId`,
        ],
        []
      ).build()
    )
    .withEntityModels([
      `${namespace}-Owners`,
      `${namespace}-TokenMetadata`,
      `${namespace}-GameRegistry`,
      `${namespace}-TokenPlayerName`,
      `${namespace}-ScoreUpdate`,
      `${namespace}-TokenContextData`,
      `${namespace}-SettingsData`,
      `${namespace}-TokenObjective`,
      `${namespace}-ObjectiveData`,
      `${namespace}-TokenRenderer`,
      `${namespace}-TokenClientUrl`,
      `${namespace}-GameMetadata`,
      `${namespace}-MinterRegistryId`,
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
    .withClause(KeysClause([`${namespace}-GameMetadata`], []).build())
    .withEntityModels([`${namespace}-GameMetadata`])
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
    .withClause(KeysClause([`${namespace}-SettingsData`, `${namespace}-GameMetadata`], []).build())
    .withEntityModels([`${namespace}-SettingsData`, `${namespace}-GameMetadata`])
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
    .withClause(KeysClause([`${namespace}-ObjectiveData`, `${namespace}-GameMetadata`], []).build())
    .withEntityModels([`${namespace}-ObjectiveData`, `${namespace}-GameMetadata`])
    .includeHashedKeys()
    .withLimit(limit);
};
