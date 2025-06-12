import { useEffect } from 'react';
import { useMiniGamesStore } from '../stores/miniGamesStore';
import { useSubscribeMiniGames } from '../hooks/useSubscribeMiniGames';
import { useGameTokensStore } from '../stores/gameTokensStore';

/**
 * Utility hook to ensure mini games store is initialized for gameMetadata relationships
 * This should be called by subscription hooks that need gameMetadata (games, settings, objectives)
 */
export function useEnsureMiniGamesStore() {
  const { isInitialized } = useMiniGamesStore();
  const { refreshGameMetadata } = useGameTokensStore();

  // Use the existing subscription hook to populate the store
  // This will be enabled only if the store is not already initialized
  const { miniGames } = useSubscribeMiniGames({
    enabled: !isInitialized,
    logging: false,
  });

  // Listen for mini games store updates and refresh gameMetadata in other stores
  useEffect(() => {
    const unsubscribe = useMiniGamesStore.subscribe((state, prevState) => {
      if (state.lastUpdated > 0 && state.lastUpdated !== prevState.lastUpdated) {
        console.log('Mini games store updated, refreshing gameMetadata in other stores');
        refreshGameMetadata();
      }
    });

    return unsubscribe;
  }, [refreshGameMetadata]);

  return { isInitialized };
}

/**
 * Utility function to refresh gameMetadata in existing game tokens
 * Call this when mini games store gets updated
 */
export function refreshGameMetadataInStores() {
  // This could be used to trigger a refresh of gameMetadata in other stores
  // For now, we'll rely on the real-time updates and the lookup in updateMergedGameData
  console.log('Mini games store updated - gameMetadata will be refreshed on next access');
}
