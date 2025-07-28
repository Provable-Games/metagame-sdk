import { useMemo } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { gameSettingsQuery } from '../queries/sql';
import { getMetagameClientSafe } from '../../shared/singleton';
import { parseSettingsData } from '../../shared/utils/dataTransformers';
import { feltToString } from '../../shared/lib';
import type { GameSettings } from '../../shared/types';

interface UseSettingsProps {
  gameAddresses?: string[];
  settingsIds?: number[];
  limit?: number;
  offset?: number;
  logging?: boolean;
}

export const useSettings = ({
  gameAddresses,
  settingsIds,
  limit = 100,
  offset = 0,
  logging = false,
}: UseSettingsProps): SqlQueryResult<GameSettings> => {
  const client = getMetagameClientSafe();

  const query = useMemo(() => {
    if (!client) return null;
    return gameSettingsQuery({
      namespace: client.getNamespace(),
      gameAddresses,
      settingsIds,
      limit,
      offset,
    });
  }, [client, gameAddresses, settingsIds, limit, offset]);

  const {
    data: rawSettingsData,
    loading,
    error,
    refetch,
  } = useSqlQuery<GameSettings>(client?.getConfig().toriiUrl || '', query, logging);

  console.log('rawSettingsData', rawSettingsData);

  const settingsData = useMemo(() => {
    if (!rawSettingsData || !rawSettingsData.length) return [];

    return rawSettingsData.map((settings: any) => {
      const settingsData = settings.settings_data || settings.data; // Support both new and legacy field names
      const parsedSettingsData = parseSettingsData(settingsData);

      const gameMetadata = settings.game_address
        ? {
            game_id: Number(settings.id) || 0,
            contract_address: settings.contract_address || '',
            name: settings.name || '',
            description: settings.description || '',
            developer: settings.developer || '',
            publisher: settings.publisher || '',
            genre: settings.genre || '',
            image: settings.image || '',
            color: settings.color,
            client_url: settings.client_url,
            renderer_address: settings.renderer_address,
          }
        : undefined;

      return {
        settings_id: Number(settings.settings_id) || 0,
        gameMetadata,
        name: parsedSettingsData?.name || '',
        description: parsedSettingsData?.description || '',
        data: parsedSettingsData?.data,
      };
    });
  }, [rawSettingsData]);

  return { data: settingsData, loading, error, refetch };
};
