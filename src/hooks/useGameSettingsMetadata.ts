import { useMemo } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { gameSettingsMetadataQuery } from '../queries/sql';
import { getMetagameClient } from '../singleton';
import { feltToString } from '../lib';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';
import { GameSettingsMetadata } from '../types/games';

interface UseGameSettingsMetadataProps {
  gameAddress: string;
  settingsIds?: number[];
  limit?: number;
  offset?: number;
  logging?: boolean;
}

export const useGameSettingsMetadata = ({
  gameAddress,
  settingsIds,
  limit = 100,
  offset = 0,
  logging = false,
}: UseGameSettingsMetadataProps): SqlQueryResult<GameSettingsMetadata> => {
  const client = getMetagameClient();
  const { gameNamespace } = useGameEndpoints(gameAddress);

  const missingConfig = !gameNamespace;

  const settingsIdKey = useMemo(() => {
    return settingsIds?.map((id) => `'${id}'`).join(',') ?? '';
  }, [settingsIds]);

  let configError = null;
  if (missingConfig) {
    let errorMessage = 'Missing required game configuration: ';
    if (!gameNamespace) errorMessage += 'Namespace, ';
    errorMessage = errorMessage.replace(/, $/, '');
    configError = errorMessage;
  }

  const query = useMemo(
    () =>
      !missingConfig
        ? gameSettingsMetadataQuery(gameNamespace ?? '', settingsIds, limit, offset)
        : null,
    [gameNamespace, settingsIdKey, limit, offset]
  );
  const {
    data: rawGameData,
    loading,
    error,
    refetch,
  } = useSqlQuery<any>(client.getConfig().toriiUrl, query, logging);

  const gameData = useMemo(() => {
    return rawGameData.map((game) => {
      const filteredGame: GameSettingsMetadata = {
        name: feltToString(game.name),
        description: game.description,
        created_at: Number(game.created_at),
        created_by: game.created_by,
        settings_id: game.settings_id,
      };
      return filteredGame;
    });
  }, [rawGameData]);

  return { data: gameData, loading, error, refetch };
};
