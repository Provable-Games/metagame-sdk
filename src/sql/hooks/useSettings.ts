import { useMemo } from 'react';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { gameSettingsQuery } from '../queries/sql';
import { getMetagameClient } from '../../shared/singleton';
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
  const client = getMetagameClient();

  const query = useMemo(
    () =>
      gameSettingsQuery({
        namespace: client.getNamespace(),
        gameAddresses,
        settingsIds,
        limit,
        offset,
      }),
    [gameAddresses, settingsIds, limit, offset]
  );

  const {
    data: rawSettingsData,
    loading,
    error,
    refetch,
  } = useSqlQuery<GameSettings>(client.getConfig().toriiUrl, query, logging);

  const settingsData = useMemo(() => {
    if (!rawSettingsData || !rawSettingsData.length) return [];

    return rawSettingsData.map((settings: any) => {
      const settingsData = settings.data;
      const parsedSettingsData = parseSettingsData(settingsData);

      const gameMetadata = settings.game_id
        ? {
            game_id: Number(settings.game_id) || 0,
            contract_address: settings.contract_address || '',
            creator_token_id: Number(settings.creator_token_id) || 0,
            name: feltToString(settings.name) || '',
            description: settings.description || '',
            developer: feltToString(settings.developer) || '',
            publisher: feltToString(settings.publisher) || '',
            genre: feltToString(settings.genre) || '',
            image: settings.image || '',
            color: settings.color,
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
