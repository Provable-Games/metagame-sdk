import { ToriiQueryBuilder, KeysClause, AndComposeClause, MemberClause } from '@dojoengine/sdk';

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
    .withClause(KeysClause([`${namespace}-SettingsData`], []).build())
    .withEntityModels([`${namespace}-SettingsData`])
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
    .withClause(KeysClause([`${namespace}-ObjectiveData`], []).build())
    .withEntityModels([`${namespace}-ObjectiveData`])
    .includeHashedKeys()
    .withLimit(limit);
};
