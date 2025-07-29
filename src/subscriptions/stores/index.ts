import { useGameTokensStore } from './gameTokensStore';
import { useMiniGamesStore } from './miniGamesStore';
import { useSettingsStore } from './settingsStore';
import { useObjectivesStore } from './objectivesStore';
import { logger } from '../../shared/utils/logger';

/**
 * Clear all subscription stores
 * Used when network changes to ensure clean state
 */
export function clearAllStores(): void {
  logger.debug('[clearAllStores] Clearing all subscription stores');
  
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