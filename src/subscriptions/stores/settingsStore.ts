import { create } from 'zustand';
import { useMiniGamesStore } from './miniGamesStore';

export interface SettingsEntity {
  entityId: string;
  SettingsData?: {
    settings_id: number;
    game_id?: number;
    data: any; // Settings data can be object or string
  };
}

// Helper function to parse and normalize settings data
const parseSettingsData = (rawData: any): { name: string; description: string; data: any } => {
  if (!rawData) return { name: '', description: '', data: {} };

  try {
    // If it's already an object, use it directly
    const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

    // Handle the current structure: {Name, Description, Settings: {}}
    const name = parsed.Name || '';
    const description = parsed.Description || '';
    const settings = parsed.Settings || parsed; // Fallback to the whole object if no Settings key

    return {
      name,
      description,
      data: settings,
    };
  } catch (error) {
    console.warn('Failed to parse settings data:', error);
    return { name: '', description: '', data: rawData };
  }
};

export interface SettingsLookup {
  [settings_id: string]: {
    game_id: number;
    gameMetadata: {
      game_id: number;
      contract_address: string;
      creator_token_id: number;
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
    if (entity.SettingsData?.settings_id) {
      const settingsId = entity.SettingsData.settings_id.toString();
      const parsedData = parseSettingsData(entity.SettingsData.data);
      const gameId = entity.SettingsData.game_id || 0;

      // Get the complete mini game data
      const gameMetadata = miniGamesStore.getMiniGameData(gameId);

      settings[settingsId] = {
        game_id: gameId,
        gameMetadata: gameMetadata,
        name: parsedData.name,
        description: parsedData.description,
        data: parsedData.data,
      };
    }
  });

  console.log('Built settings lookup from', entities.length, 'entities:', settings);
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
    if (!entity.SettingsData?.settings_id) return;

    const settingsId = entity.SettingsData.settings_id.toString();
    const parsedData = parseSettingsData(entity.SettingsData.data);
    const gameId = entity.SettingsData.game_id || 0;

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
