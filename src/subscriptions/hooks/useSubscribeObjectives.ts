import { getMetagameClient } from '../../shared/singleton';
import { useEventSubscription } from '../../shared/dojo/hooks/useEventSubscription';
import { useEffect } from 'react';
import { useObjectivesStore } from '../stores/objectivesStore';
import { objectivesQuery } from '../queries/sdk';

export interface UseSubscribeObjectivesParams {
  enabled?: boolean;
  logging?: boolean;
  // Filter options (same as useMergedObjectives)
  game_id?: string | number;
  objective_ids?: string[];
}

export interface UseSubscribeObjectivesResult {
  // Subscription status
  isSubscribed: boolean;
  error: any;

  // Store data with complete game metadata
  objectives: Record<
    string,
    {
      data: string;
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
    }
  >;
  getObjectiveData: (objective_id: string) => string | null;
  getObjectivesForGame: (objective_ids: string[], game_id: string | number) => string[];
  isInitialized: boolean;
}

export function useSubscribeObjectives(
  params: UseSubscribeObjectivesParams = {}
): UseSubscribeObjectivesResult {
  const client = getMetagameClient();
  const { enabled = true, logging = false, game_id, objective_ids } = params;

  const query = objectivesQuery({ namespace: client.getNamespace() });

  const { entities, isSubscribed, error } = useEventSubscription(client, {
    query,
    namespace: client.getNamespace(),
    enabled,
    logging,
  });

  const {
    initializeStore,
    updateEntity,
    objectives,
    isInitialized,
    getObjectivesByFilter,
    getObjectiveData,
    getObjectivesForGame,
  } = useObjectivesStore();

  // Initialize store with all entities on first load
  useEffect(() => {
    if (entities && entities.length > 0) {
      console.log('Initializing objectives store with', entities.length, 'entities');
      initializeStore(entities);
    }
  }, [entities, initializeStore]);

  // Apply filters to get filtered objectives (same logic as useMergedObjectives)
  const filteredObjectives = getObjectivesByFilter({
    game_id,
    objective_ids,
  });

  return {
    // Subscription status
    isSubscribed,
    error,

    // Store data (filtered based on params)
    objectives: filteredObjectives,
    getObjectiveData,
    getObjectivesForGame,
    isInitialized,
  };
}
