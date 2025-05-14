import { useMemo } from 'react';
import { useSqlQuery } from '../services/sqlService';
import { gameSettingsMetadataQuery } from '../queries/sql';
import { getMetagameClient } from '../singleton';
import { feltToString } from '../lib';
import { useGameEndpoints } from '../dojo/hooks/useGameEndpoints';
import { GameSettingsMetadata } from '../types/games';
import { SqlResponse } from '../types/responses';

interface UseGameSettingsMetadataProps {
  gameAddresses: string[];
  settingsIds?: Record<string, number[]>;
  limit?: number;
  offset?: number;
  logging?: boolean;
}

export const useGameSettingsMetadata = ({
  gameAddresses,
  settingsIds,
  limit = 100,
  offset = 0,
  logging = false,
}: UseGameSettingsMetadataProps): SqlResponse<Record<string, GameSettingsMetadata[]>> => {
  const client = getMetagameClient();
  const gameEndpoints = useGameEndpoints(gameAddresses);

  const missingConfig = !gameEndpoints;

  const settingsIdKey = useMemo(() => {
    if (!settingsIds) return '';

    // Get all unique IDs from all namespaces
    const allIds = Object.values(settingsIds)
      .flat()
      .map((id) => `'${id}'`)
      .join(',');

    return allIds;
  }, [settingsIds]);

  let configError = null;
  if (missingConfig) {
    let errorMessage = 'Missing required game configuration: ';
    if (!gameEndpoints) errorMessage += 'Game endpoints, ';
    if (gameEndpoints && gameAddresses.some((address) => !gameEndpoints[address])) {
      errorMessage += 'Some game addresses missing configuration, ';
    }
    errorMessage = errorMessage.replace(/, $/, '');
    configError = errorMessage;

    // throw new Error(errorMessage);
  }

  const query = useMemo(() => {
    if (missingConfig) return null;

    const gameNamespaces = gameAddresses
      .filter((address) => gameEndpoints?.[address])
      .map((address) => gameEndpoints?.[address]?.namespace)
      .filter((namespace): namespace is string => namespace !== undefined && namespace !== null);

    return gameSettingsMetadataQuery(gameNamespaces, settingsIds, limit, offset);
  }, [gameEndpoints, gameAddresses, settingsIdKey, limit, offset]);

  const {
    data: rawSettingsMetadata,
    loading,
    error,
    refetch,
  } = useSqlQuery<any>(client.getConfig().toriiUrl, query, logging);

  const settingsMetadata = useMemo(() => {
    if (!rawSettingsMetadata) return {};

    // Initialize an empty record with arrays for each game address
    const gameDataRecord: Record<string, GameSettingsMetadata[]> = {};
    gameAddresses.forEach((address) => {
      gameDataRecord[address] = [];
    });

    // Group settings metadata by game address
    rawSettingsMetadata.forEach((settingMetadata) => {
      const gameAddress = Object.entries(gameEndpoints || {}).find(
        ([_, endpoints]) => endpoints?.namespace === settingMetadata.namespace
      )?.[0];

      if (gameAddress) {
        const filteredGame: GameSettingsMetadata = {
          name: feltToString(settingMetadata.name),
          description: settingMetadata.description,
          created_at: Number(settingMetadata.created_at),
          created_by: settingMetadata.created_by,
          settings_id: settingMetadata.settings_id,
        };

        gameDataRecord[gameAddress].push(filteredGame);
      }
    });

    return gameDataRecord;
  }, [rawSettingsMetadata, gameEndpoints, gameAddresses]);

  return {
    data: settingsMetadata,
    loading,
    error: error || configError,
    refetch,
  };
};
