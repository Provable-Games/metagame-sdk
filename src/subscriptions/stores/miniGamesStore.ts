import { create } from 'zustand';
import { feltToString } from '../../shared/lib';

export interface MiniGameEntity {
  entityId: string;
  GameMetadataUpdate?: {
    id: string | number; // This is the game_id
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
  };
}

export interface MiniGamesLookup {
  [game_id: string]: {
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
  updateMiniGames: (entities: MiniGameEntity[]) => void;

  // Getters
  getMiniGamesByFilter: (filter: {
    gameAddresses?: string[];
    creatorTokenId?: number;
  }) => MiniGamesLookup;
  getMiniGameData: (game_id: string | number) => MiniGamesLookup[string] | null;
  getMiniGameByContractAddress: (contract_address: string) => MiniGamesLookup[string] | null;
}

export const useMiniGamesStore = create<MiniGamesState>((set, get) => ({
  // Initial state
  miniGames: {},
  isInitialized: false,
  lastUpdated: 0,
  totalEntities: 0,

  // Actions
  initializeStore: (entities: MiniGameEntity[]) => {
    console.log('miniGamesStore: initializeStore called with', entities.length, 'entities');
    const miniGames: MiniGamesLookup = {};

    entities.forEach((entity) => {
      if (entity.GameMetadataUpdate) {
        const gameId = String(entity.GameMetadataUpdate.id);
        const processedGame = {
          game_id: Number(entity.GameMetadataUpdate.id) || 0,
          contract_address: entity.GameMetadataUpdate.contract_address || '',
          name: entity.GameMetadataUpdate.name || '',
          description: entity.GameMetadataUpdate.description || '',
          developer: entity.GameMetadataUpdate.developer || '',
          publisher: entity.GameMetadataUpdate.publisher || '',
          genre: entity.GameMetadataUpdate.genre || '',
          image: entity.GameMetadataUpdate.image || '',
          color: entity.GameMetadataUpdate.color,
          client_url: entity.GameMetadataUpdate.client_url,
          renderer_address: entity.GameMetadataUpdate.renderer_address,
        };

        miniGames[gameId] = processedGame;
      }
    });

    console.log('miniGamesStore: built', Object.keys(miniGames).length, 'mini games');
    console.log('miniGamesStore: sample mini games:', Object.values(miniGames).slice(0, 2));

    set({
      miniGames,
      isInitialized: true,
      lastUpdated: Date.now(),
      totalEntities: entities.length,
    });
  },

  updateEntity: (entity: MiniGameEntity) => {
    if (!entity.GameMetadataUpdate) return;

    const state = get();
    console.log(entity);
    const gameId = entity.GameMetadataUpdate.id.toString();

    console.log(entity);

    const updatedMiniGames = {
      ...state.miniGames,
      [gameId]: {
        game_id: Number(entity.GameMetadataUpdate.id),
        contract_address: entity.GameMetadataUpdate.contract_address,
        name: entity.GameMetadataUpdate.name,
        description: entity.GameMetadataUpdate.description || '', // description is already a string
        developer: entity.GameMetadataUpdate.developer,
        publisher: entity.GameMetadataUpdate.publisher,
        genre: entity.GameMetadataUpdate.genre,
        image: entity.GameMetadataUpdate.image || '',
        color: entity.GameMetadataUpdate.color,
        client_url: entity.GameMetadataUpdate.client_url,
        renderer_address: entity.GameMetadataUpdate.renderer_address,
      },
    };

    set({
      miniGames: updatedMiniGames,
      lastUpdated: Date.now(),
    });
  },

  clearStore: () => {
    set({
      miniGames: {},
      isInitialized: false,
      lastUpdated: 0,
      totalEntities: 0,
    });
  },

  updateMiniGames: (entities: MiniGameEntity[]) => {
    const miniGames = entities.reduce((acc, entity) => {
      if (entity.GameMetadataUpdate) {
        const gameId = String(entity.GameMetadataUpdate.id);
        const processedGame = {
          game_id: Number(entity.GameMetadataUpdate.id) || 0,
          contract_address: entity.GameMetadataUpdate.contract_address || '',
          name: entity.GameMetadataUpdate.name || '',
          description: entity.GameMetadataUpdate.description || '',
          developer: entity.GameMetadataUpdate.developer || '',
          publisher: entity.GameMetadataUpdate.publisher || '',
          genre: entity.GameMetadataUpdate.genre || '',
          image: entity.GameMetadataUpdate.image || '',
          color: entity.GameMetadataUpdate.color,
          client_url: entity.GameMetadataUpdate.client_url,
          renderer_address: entity.GameMetadataUpdate.renderer_address,
        };

        acc[gameId] = processedGame;
      }
      return acc;
    }, {} as MiniGamesLookup);

    set((state) => ({
      miniGames,
      lastUpdated: Date.now(),
    }));
  },

  // Getters
  getMiniGamesByFilter: (filter) => {
    const state = get();
    let filtered = { ...state.miniGames };

    if (filter.gameAddresses && filter.gameAddresses.length > 0) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, game]) =>
          filter.gameAddresses!.includes(game.contract_address)
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
