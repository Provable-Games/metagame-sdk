import { getMetagameClient } from '../../shared/singleton';
import { useEventSubscription } from '../../shared/dojo/hooks/useEventSubscription';
import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { settingsQuery } from '../queries/sdk';

export interface UseSubscribeSettingsParams {
  enabled?: boolean;
  logging?: boolean;
  // Filter options (same as useMergedSettings)
  settings_ids?: string[];
  game_id?: string | number;
}

export interface UseSubscribeSettingsResult {
  // Subscription status
  isSubscribed: boolean;
  error: any;

  // Store data with complete game metadata
  settings: Record<
    string,
    {
      game_id: number;
      gameMetadata: {
        game_id: string;
        contract_address: string;
        creator_address: string;
        name: string;
        description: string;
        developer: string;
        publisher: string;
        genre: string;
        image: string;
        color?: string;
      } | null;
      name: string;
      description: string;
      data: any;
    }
  >;
  getSettingsData: (settings_id: string) => any;
  isInitialized: boolean;
}

export function useSubscribeSettings(
  params: UseSubscribeSettingsParams = {}
): UseSubscribeSettingsResult {
  const client = getMetagameClient();
  const { enabled = true, logging = false, settings_ids, game_id } = params;

  const query = settingsQuery({ namespace: client.getNamespace() });

  const { entities, isSubscribed, error } = useEventSubscription(client, {
    query,
    namespace: client.getNamespace(),
    enabled,
    logging,
  });

  const {
    initializeStore,
    updateEntity,
    settings,
    isInitialized,
    getSettingsByFilter,
    getSettingsData,
  } = useSettingsStore();

  // Initialize store with all entities on first load
  useEffect(() => {
    if (entities && entities.length > 0) {
      console.log('Initializing settings store with', entities.length, 'entities');
      initializeStore(entities);
    }
  }, [entities, initializeStore]);

  // Apply filters to get filtered settings (same logic as useMergedSettings)
  const filteredSettings = getSettingsByFilter({
    settings_ids,
    game_id,
  });

  return {
    // Subscription status
    isSubscribed,
    error,

    // Store data (filtered based on params)
    settings: filteredSettings,
    getSettingsData,
    isInitialized,
  };
}
