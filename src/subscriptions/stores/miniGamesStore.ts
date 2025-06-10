import { create } from 'zustand';
import { feltToString } from '../../shared/lib';

export interface MiniGameEntity {
  entityId: string;
  GameMetadata?: {
    id: string | number; // This is the game_id
    contract_address: string;
    creator_address: string;
    name: string;
    description: string;
    developer: string;
    publisher: string;
    genre: string;
    image: string;
    color?: string;
  };
}

export interface MiniGamesLookup {
  [game_id: string]: {
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
  };
}

interface MiniGamesState {
  // Core data
  miniGames: MiniGamesLookup;

  // Metadata
  isInitialized: boolean;
  lastUpdated: number;
  totalEntities: number;

  // Actions
  initializeStore: (entities: MiniGameEntity[]) => void;
  updateEntity: (entity: MiniGameEntity) => void;
  clearStore: () => void;

  // Getters
  getMiniGamesByFilter: (filter: {
    game_ids?: string[] | number[];
    contract_addresses?: string[];
    creator_address?: string;
  }) => MiniGamesLookup;
  getMiniGameData: (game_id: string | number) => MiniGamesLookup[string] | null;
  getMiniGameByContractAddress: (contract_address: string) => MiniGamesLookup[string] | null;
}

function buildMiniGamesFromEntities(entities: MiniGameEntity[]): MiniGamesLookup {
  const miniGames: MiniGamesLookup = {};

  entities.forEach((entity) => {
    if (entity.GameMetadata?.id && entity.GameMetadata?.contract_address) {
      const gameId = entity.GameMetadata.id.toString();
      miniGames[gameId] = {
        game_id: gameId,
        contract_address: entity.GameMetadata.contract_address,
        creator_address: entity.GameMetadata.creator_address,
        name: feltToString(entity.GameMetadata.name),
        description: entity.GameMetadata.description,
        developer: feltToString(entity.GameMetadata.developer),
        publisher: feltToString(entity.GameMetadata.publisher),
        genre: feltToString(entity.GameMetadata.genre),
        image: entity.GameMetadata.image,
        color: entity.GameMetadata.color,
      };
    }
  });

  console.log('Built mini games lookup from', entities.length, 'entities:', miniGames);
  return miniGames;
}

export const useMiniGamesStore = create<MiniGamesState>((set, get) => ({
  // Initial state
  miniGames: {},
  isInitialized: false,
  lastUpdated: 0,
  totalEntities: 0,

  // Actions
  initializeStore: (entities: MiniGameEntity[]) => {
    const miniGames = buildMiniGamesFromEntities(entities);

    set({
      miniGames,
      isInitialized: true,
      lastUpdated: Date.now(),
      totalEntities: entities.length,
    });
  },

  updateEntity: (entity: MiniGameEntity) => {
    if (!entity.GameMetadata?.id || !entity.GameMetadata?.contract_address) return;

    const gameId = entity.GameMetadata.id.toString();
    const gameData = {
      game_id: gameId,
      contract_address: entity.GameMetadata.contract_address,
      creator_address: entity.GameMetadata.creator_address,
      name: feltToString(entity.GameMetadata.name),
      description: entity.GameMetadata.description,
      developer: feltToString(entity.GameMetadata.developer),
      publisher: feltToString(entity.GameMetadata.publisher),
      genre: feltToString(entity.GameMetadata.genre),
      image: entity.GameMetadata.image,
      color: entity.GameMetadata.color,
    };

    set((state) => ({
      miniGames: {
        ...state.miniGames,
        [gameId]: gameData,
      },
      lastUpdated: Date.now(),
    }));
  },

  clearStore: () => {
    set({
      miniGames: {},
      isInitialized: false,
      lastUpdated: 0,
      totalEntities: 0,
    });
  },

  // Getters
  getMiniGamesByFilter: (filter) => {
    const state = get();
    let filtered = { ...state.miniGames };

    if (filter.game_ids && filter.game_ids.length > 0) {
      const gameIdStrings = filter.game_ids.map((id) => id.toString());
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([gameId]) => gameIdStrings.includes(gameId))
      );
    }

    if (filter.contract_addresses && filter.contract_addresses.length > 0) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, game]) =>
          filter.contract_addresses!.includes(game.contract_address)
        )
      );
    }

    if (filter.creator_address) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(
          ([_, game]) => game.creator_address === filter.creator_address
        )
      );
    }

    return filtered;
  },

  getMiniGameData: (game_id: string | number) => {
    const state = get();
    const gameIdStr = game_id.toString();
    const game = state.miniGames[gameIdStr];
    return game || null;
  },

  getMiniGameByContractAddress: (contract_address: string) => {
    const state = get();
    const game = Object.values(state.miniGames).find(
      (game) => game.contract_address === contract_address
    );
    return game || null;
  },
}));
