import { create } from 'zustand';
import { useMiniGamesStore } from './miniGamesStore';

export interface ObjectiveEntity {
  entityId: string;
  ObjectiveData?: {
    objective_id: number;
    game_id: number;
    data: string;
  };
}

export interface ObjectivesLookup {
  [objective_id: string]: {
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
    game_id?: string | number;
    objective_ids?: string[];
  }) => ObjectivesLookup;
  getObjectiveData: (objective_id: string) => string | null;
  getObjectivesForGame: (objective_ids: string[], game_id: string | number) => string[];
}

function buildObjectivesFromEntities(entities: ObjectiveEntity[]): ObjectivesLookup {
  const objectives: ObjectivesLookup = {};

  // Get the mini games store to get complete game metadata
  const miniGamesStore = useMiniGamesStore.getState();

  entities.forEach((entity) => {
    if (entity.ObjectiveData?.objective_id) {
      const objectiveId = entity.ObjectiveData.objective_id.toString();
      const gameId = entity.ObjectiveData.game_id;

      // Get the complete mini game data
      const gameMetadata = miniGamesStore.getMiniGameData(gameId);

      objectives[objectiveId] = {
        data: entity.ObjectiveData.data,
        game_id: gameId,
        gameMetadata: gameMetadata,
      };
    }
  });

  console.log('Built objectives lookup from', entities.length, 'entities:', objectives);
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
    if (!entity.ObjectiveData?.objective_id) return;

    const objectiveId = entity.ObjectiveData.objective_id.toString();
    const gameId = entity.ObjectiveData.game_id;

    // Get the mini games store to get complete game metadata
    const miniGamesStore = useMiniGamesStore.getState();
    const gameMetadata = miniGamesStore.getMiniGameData(gameId);

    const objectiveData = {
      data: entity.ObjectiveData.data,
      game_id: gameId,
      gameMetadata: gameMetadata,
    };

    set((state) => ({
      objectives: {
        ...state.objectives,
        [objectiveId]: objectiveData,
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

    if (filter.game_id) {
      const gameIdStr = filter.game_id.toString();
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, obj]) => obj.game_id.toString() === gameIdStr)
      );
    }

    if (filter.objective_ids && filter.objective_ids.length > 0) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([objId]) => filter.objective_ids!.includes(objId))
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
