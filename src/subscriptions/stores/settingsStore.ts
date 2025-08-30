import { create } from 'zustand';
import { useMiniGamesStore } from './miniGamesStore';
import { logger } from '../../shared/utils/logger';

export interface SettingsEntity {
  entityId: string;
  SettingsCreated?: {
    settings_id: number | string;
    game_id?: number | string;
    game_address?: string;
    creator_address?: string;
    settings_data: any; // Settings data can be object or string
    data?: any; // Legacy field for backward compatibility
  };
}

// Helper function to parse and normalize settings data
const parseSettingsData = (rawData: any): { name: string; description: string; data: any } => {
  if (!rawData) {
    logger.debug('parseSettingsData: No raw data provided');
    return { name: '', description: '', data: {} };
  }

  try {
    // If it's already an object, use it directly
    const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

    logger.debug('parseSettingsData: Parsed data:', parsed);

    // Handle the current structure: {Name, Description, Settings: {}}
    const name = parsed.Name || '';
    const description = parsed.Description || '';
    const settings = parsed.Settings || parsed; // Fallback to the whole object if no Settings key

    const result = {
      name,
      description,
      data: settings,
    };

    logger.debug('parseSettingsData: Result:', result);
    return result;
  } catch (error) {
    logger.warn('Failed to parse settings data:', error, 'Raw data:', rawData);
    return { name: '', description: '', data: rawData };
  }
};

export interface SettingsLookup {
  [settings_id: string]: {
    game_id: number;
    gameMetadata: {
      game_id: number;
      contract_address: string;
      name: string;
      description: string;
      developer: string;
      publisher: string;
      genre: string;
      image: string;
      color?: string;
      client_url?: string;
      renderer_address?: string;
    } | null;
    name: string;
    description: string;
    data: any;
  };
}

interface SettingsState {
  // Core data
  settings: SettingsLookup;

  // Metadata
  isInitialized: boolean;
  lastUpdated: number;
  totalEntities: number;

  // Actions
  initializeStore: (entities: SettingsEntity[]) => void;
  updateEntity: (entity: SettingsEntity) => void;
  clearStore: () => void;

  // Getters
  getSettingsByFilter: (filter: {
    gameAddresses?: string[];
    settingsIds?: number[];
  }) => SettingsLookup;
  getSettingsData: (settings_id: string) => any;
}

function buildSettingsFromEntities(entities: SettingsEntity[]): SettingsLookup {
  const settings: SettingsLookup = {};

  // Get the mini games store to get complete game metadata
  const miniGamesStore = useMiniGamesStore.getState();

  entities.forEach((entity) => {
    if (entity.SettingsCreated?.settings_id !== undefined) {
      const settingsId = entity.SettingsCreated.settings_id.toString();
      const parsedData = parseSettingsData(
        entity.SettingsCreated.settings_data || entity.SettingsCreated.data
      );

      // First try to get game_id directly, then try to find by game_address
      let gameId = 0;
      let gameMetadata = null;

      if (entity.SettingsCreated.game_address) {
        // Try to find game by contract address
        gameMetadata = miniGamesStore.getMiniGameByContractAddress(
          entity.SettingsCreated.game_address
        );
        if (gameMetadata) {
          gameId = gameMetadata.game_id;
        }
      }

      settings[settingsId] = {
        game_id: gameId,
        gameMetadata: gameMetadata,
        name: parsedData.name,
        description: parsedData.description,
        data: parsedData.data,
      };
    }
  });

  logger.debug('Built settings lookup from', entities.length, 'entities:', settings);
  return settings;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  settings: {},
  isInitialized: false,
  lastUpdated: 0,
  totalEntities: 0,

  // Actions
  initializeStore: (entities: SettingsEntity[]) => {
    const settings = buildSettingsFromEntities(entities);

    set({
      settings,
      isInitialized: true,
      lastUpdated: Date.now(),
      totalEntities: entities.length,
    });
  },

  updateEntity: (entity: SettingsEntity) => {
    if (entity.SettingsCreated?.settings_id === undefined) return;

    const settingsId = entity.SettingsCreated.settings_id.toString();
    const parsedData = parseSettingsData(
      entity.SettingsCreated.settings_data || entity.SettingsCreated.data
    );
    const gameId = Number(entity.SettingsCreated.game_id) || 0;

    // Get the mini games store to get complete game metadata
    const miniGamesStore = useMiniGamesStore.getState();
    const gameMetadata = miniGamesStore.getMiniGameData(gameId);

    const settingsData = {
      game_id: gameId,
      gameMetadata: gameMetadata,
      name: parsedData.name,
      description: parsedData.description,
      data: parsedData.data,
    };

    set((state) => ({
      settings: {
        ...state.settings,
        [settingsId]: settingsData,
      },
      lastUpdated: Date.now(),
    }));
  },

  clearStore: () => {
    set({
      settings: {},
      isInitialized: false,
      lastUpdated: 0,
      totalEntities: 0,
    });
  },

  // Getters
  getSettingsByFilter: (filter) => {
    const state = get();
    let filtered = { ...state.settings };

    if (filter.settingsIds && filter.settingsIds.length > 0) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([settingsId]) =>
          filter.settingsIds!.includes(Number(settingsId))
        )
      );
    }

    if (filter.gameAddresses && filter.gameAddresses.length > 0) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(
          ([_, settings]) =>
            settings.gameMetadata &&
            filter.gameAddresses!.includes(settings.gameMetadata.contract_address)
        )
      );
    }

    return filtered;
  },

  getSettingsData: (settings_id: string) => {
    const state = get();
    const settings = state.settings[settings_id];
    return settings ? settings.data : null;
  },
}));
