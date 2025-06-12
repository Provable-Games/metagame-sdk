import { create } from 'zustand';
import { feltToString } from '../../shared/lib';

export interface MiniGameEntity {
  entityId: string;
  GameMetadata?: {
    id: string | number; // This is the game_id
    contract_address: string;
    creator_token_id: string | number;
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
    game_ids?: (string | number)[];
    contract_addresses?: string[];
    creator_token_id?: string | number;
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
      const gameMetadata = entity.GameMetadata;
      if (gameMetadata) {
        const gameId = String(gameMetadata.id);
        const processedGame = {
          game_id: Number(gameMetadata.id) || 0,
          contract_address: gameMetadata.contract_address || '',
          creator_token_id: Number(gameMetadata.creator_token_id) || 0,
          name: feltToString(gameMetadata.name) || '',
          description: gameMetadata.description || '',
          developer: feltToString(gameMetadata.developer) || '',
          publisher: feltToString(gameMetadata.publisher) || '',
          genre: feltToString(gameMetadata.genre) || '',
          image: gameMetadata.image || '',
          color: gameMetadata.color,
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
    if (!entity.GameMetadata) return;

    const state = get();
    const gameId = entity.GameMetadata.id.toString();

    const updatedMiniGames = {
      ...state.miniGames,
      [gameId]: {
        game_id: Number(entity.GameMetadata.id),
        contract_address: entity.GameMetadata.contract_address,
        creator_token_id: Number(entity.GameMetadata.creator_token_id) || 0,
        name: feltToString(entity.GameMetadata.name),
        description: entity.GameMetadata.description || '', // description is already a string
        developer: feltToString(entity.GameMetadata.developer),
        publisher: feltToString(entity.GameMetadata.publisher),
        genre: feltToString(entity.GameMetadata.genre),
        image: entity.GameMetadata.image || '',
        color: entity.GameMetadata.color,
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
      const gameMetadata = entity.GameMetadata;
      if (gameMetadata) {
        const gameId = String(gameMetadata.id);
        const processedGame = {
          game_id: Number(gameMetadata.id) || 0,
          contract_address: gameMetadata.contract_address || '',
          creator_token_id: Number(gameMetadata.creator_token_id) || 0,
          name: feltToString(gameMetadata.name) || '',
          description: gameMetadata.description || '',
          developer: feltToString(gameMetadata.developer) || '',
          publisher: feltToString(gameMetadata.publisher) || '',
          genre: feltToString(gameMetadata.genre) || '',
          image: gameMetadata.image || '',
          color: gameMetadata.color,
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
  getMiniGamesByFilter: (filter: {
    game_ids?: (string | number)[];
    contract_addresses?: string[];
    creator_token_id?: string | number;
  }) => {
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

    if (filter.creator_token_id !== undefined) {
      const creatorTokenId = Number(filter.creator_token_id);
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, game]) => game.creator_token_id === creatorTokenId)
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
