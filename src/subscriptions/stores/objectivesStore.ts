import { create } from 'zustand';
import { useMiniGamesStore } from './miniGamesStore';
import { logger } from '../../shared/utils/logger';

export interface ObjectiveEntity {
  entityId: string;
  ObjectiveCreated?: {
    objective_id: number | string;
    game_id?: number | string;
    game_address?: string;
    creator_address?: string;
    objective_data: string;
    data?: string; // Legacy field for backward compatibility
  };
}

export interface ObjectivesLookup {
  [objective_id: string]: {
    data: string;
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
  };
}

interface ObjectivesState {
  // Core data
  objectives: ObjectivesLookup;

  // Metadata
  isInitialized: boolean;
  lastUpdated: number;
  totalEntities: number;

  // Actions
  initializeStore: (entities: ObjectiveEntity[]) => void;
  updateEntity: (entity: ObjectiveEntity) => void;
  clearStore: () => void;

  // Getters
  getObjectivesByFilter: (filter: {
    gameAddresses?: string[];
    objectiveIds?: number[];
  }) => ObjectivesLookup;
  getObjectiveData: (objective_id: string) => string | null;
  getObjectivesForGame: (objective_ids: string[], game_id: string | number) => string[];
}

function buildObjectivesFromEntities(entities: ObjectiveEntity[]): ObjectivesLookup {
  const objectives: ObjectivesLookup = {};

  // Get the mini games store to get complete game metadata
  const miniGamesStore = useMiniGamesStore.getState();

  entities.forEach((entity) => {
    if (entity.ObjectiveCreated?.objective_id) {
      const objectiveId = entity.ObjectiveCreated.objective_id.toString();
      
      // Get objective data (from objective_data or legacy data field)
      const objectiveData = entity.ObjectiveCreated.objective_data || entity.ObjectiveCreated.data || '';
      
      // First try to get game_id directly, then try to find by game_address
      let gameId = Number(entity.ObjectiveCreated.game_id) || 0;
      let gameMetadata = null;
      
      if (gameId && gameId !== 0) {
        gameMetadata = miniGamesStore.getMiniGameData(gameId);
      } else if (entity.ObjectiveCreated.game_address) {
        // Try to find game by contract address
        gameMetadata = miniGamesStore.getMiniGameByContractAddress(entity.ObjectiveCreated.game_address);
        if (gameMetadata) {
          gameId = gameMetadata.game_id;
        }
      }

      objectives[objectiveId] = {
        data: objectiveData,
        game_id: gameId,
        gameMetadata: gameMetadata,
      };
    }
  });

  logger.debug('Built objectives lookup from', entities.length, 'entities:', objectives);
  return objectives;
}

export const useObjectivesStore = create<ObjectivesState>((set, get) => ({
  // Initial state
  objectives: {},
  isInitialized: false,
  lastUpdated: 0,
  totalEntities: 0,

  // Actions
  initializeStore: (entities: ObjectiveEntity[]) => {
    const objectives = buildObjectivesFromEntities(entities);

    set({
      objectives,
      isInitialized: true,
      lastUpdated: Date.now(),
      totalEntities: entities.length,
    });
  },

  updateEntity: (entity: ObjectiveEntity) => {
    if (!entity.ObjectiveCreated?.objective_id) return;

    const objectiveId = entity.ObjectiveCreated.objective_id.toString();
    
    // Get objective data (from objective_data or legacy data field)
    const objectiveData = entity.ObjectiveCreated.objective_data || entity.ObjectiveCreated.data || '';
    
    // Get the mini games store to get complete game metadata
    const miniGamesStore = useMiniGamesStore.getState();
    
    // First try to get game_id directly, then try to find by game_address
    let gameId = Number(entity.ObjectiveCreated.game_id) || 0;
    let gameMetadata = null;
    
    if (gameId && gameId !== 0) {
      gameMetadata = miniGamesStore.getMiniGameData(gameId);
    } else if (entity.ObjectiveCreated.game_address) {
      // Try to find game by contract address
      gameMetadata = miniGamesStore.getMiniGameByContractAddress(entity.ObjectiveCreated.game_address);
      if (gameMetadata) {
        gameId = gameMetadata.game_id;
      }
    }
    
    logger.debug('Objective update:', {
      objectiveId,
      gameId,
      game_address: entity.ObjectiveCreated.game_address,
      objectiveData,
      gameMetadata
    });

    const objectiveDataForStore = {
      data: objectiveData,
      game_id: gameId,
      gameMetadata: gameMetadata,
    };

    set((state) => ({
      objectives: {
        ...state.objectives,
        [objectiveId]: objectiveDataForStore,
      },
      lastUpdated: Date.now(),
    }));
  },

  clearStore: () => {
    set({
      objectives: {},
      isInitialized: false,
      lastUpdated: 0,
      totalEntities: 0,
    });
  },

  // Getters
  getObjectivesByFilter: (filter) => {
    const state = get();
    let filtered = { ...state.objectives };

    if (filter.gameAddresses && filter.gameAddresses.length > 0) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(
          ([_, obj]) =>
            obj.gameMetadata && filter.gameAddresses!.includes(obj.gameMetadata.contract_address)
        )
      );
    }

    if (filter.objectiveIds && filter.objectiveIds.length > 0) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([objId]) => filter.objectiveIds!.includes(Number(objId)))
      );
    }

    return filtered;
  },

  getObjectiveData: (objective_id: string) => {
    const state = get();
    const objective = state.objectives[objective_id];
    return objective ? objective.data : null;
  },

  getObjectivesForGame: (objective_ids: string[], game_id: string | number) => {
    const state = get();
    const gameIdStr = game_id.toString();

    return objective_ids
      .map((objectiveId) => {
        const objective = state.objectives[objectiveId];
        // Filter by game_id to prevent cross-game contamination
        if (objective && objective.game_id.toString() === gameIdStr) {
          return objective.data;
        }
        return null;
      })
      .filter(Boolean) as string[];
  },
}));
