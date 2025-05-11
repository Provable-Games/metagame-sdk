import { useMemo } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { gameSettingsQuery } from '../queries/sql';
import { getMetagameClient } from '../singleton';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';

interface UseGameSettingsProps {
  gameAddress: string;
  settingsIds?: number[];
  limit?: number;
  offset?: number;
  logging?: boolean;
}

interface GameSettings {
  contract_address: string;
  account_address: string;
  token_id: string;
  metadata: string;
}

export const useGameSettings = ({
  gameAddress,
  settingsIds,
  limit = 100,
  offset = 0,
  logging = false,
}: UseGameSettingsProps): SqlQueryResult<GameSettings> => {
  const client = getMetagameClient();
  const gameEndpoints = useGameEndpoints([gameAddress]);
  const addressEndpoints = gameEndpoints?.[gameAddress];
  const { settingsModel, namespace } = addressEndpoints ?? {};

  const missingConfig = !settingsModel || !namespace;

  let configError = null;
  if (missingConfig) {
    let errorMessage = 'Missing required game configuration: ';
    if (!settingsModel) errorMessage += 'Settings Model, ';
    if (!namespace) errorMessage += 'Namespace, ';
    errorMessage = errorMessage.replace(/, $/, '');
    configError = errorMessage;
  }

  const query = useMemo(
    () =>
      !missingConfig
        ? gameSettingsQuery(namespace ?? '', settingsModel ?? '', settingsIds, limit, offset)
        : null,
    [namespace, settingsModel, settingsIds, limit, offset]
  );
  const { data, loading, error, refetch } = useSqlQuery<GameSettings>(
    client.getConfig().toriiUrl,
    query,
    logging
  );
  return { data, loading, error, refetch };
};
