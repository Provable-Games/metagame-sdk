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
  const { gameNamespace, gameSettingsModel } = useGameEndpoints(gameAddress);

  const missingConfig = !gameSettingsModel || !gameNamespace;

  let configError = null;
  if (missingConfig) {
    let errorMessage = 'Missing required game configuration: ';
    if (!gameSettingsModel) errorMessage += 'Settings Model, ';
    if (!gameNamespace) errorMessage += 'Namespace, ';
    errorMessage = errorMessage.replace(/, $/, '');
    configError = errorMessage;
  }

  const query = useMemo(
    () =>
      !missingConfig
        ? gameSettingsQuery(
            gameNamespace ?? '',
            gameSettingsModel ?? '',
            settingsIds,
            limit,
            offset
          )
        : null,
    [gameNamespace, gameSettingsModel, settingsIds, limit, offset]
  );
  const { data, loading, error, refetch } = useSqlQuery<GameSettings>(
    client.getConfig().toriiUrl,
    query,
    logging
  );
  return { data, loading, error, refetch };
};
