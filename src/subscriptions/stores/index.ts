import { useGameTokensStore } from './gameTokensStore';
import { useMiniGamesStore } from './miniGamesStore';
import { useSettingsStore } from './settingsStore';
import { useObjectivesStore } from './objectivesStore';

/**
 * Clear all subscription stores
 * Used when network changes to ensure clean state
 */
export function clearAllStores(): void {
  console.log('[clearAllStores] Clearing all subscription stores');
  
  // Get the current store states and clear them
  useGameTokensStore.getState().clearStore();
  useMiniGamesStore.getState().clearStore();
  useSettingsStore.getState().clearStore();
  useObjectivesStore.getState().clearStore();
}

// Re-export stores
export { useGameTokensStore } from './gameTokensStore';
export { useMiniGamesStore } from './miniGamesStore';
export { useSettingsStore } from './settingsStore';
export { useObjectivesStore } from './objectivesStore';