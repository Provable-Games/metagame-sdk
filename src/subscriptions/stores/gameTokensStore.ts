import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { feltToString } from '../../shared/lib';
import type { GameTokenData, EntityData } from '../../shared/utils/dataTransformers';
import { parseContextData, parseSettingsData } from '../../shared/utils/dataTransformers';
import { useMiniGamesStore } from './miniGamesStore';

interface RelationshipMaps {
  objectiveToTokens: Map<string, string[]>; // objective_id -> array of token_ids
  settingsToTokens: Map<string, string[]>; // settings_id -> array of token_ids
  gameToTokens: Map<string, string[]>;
  // Reverse lookups for data entities
  settingsDataById: Map<string, EntityData>; // settings_id -> SettingsData entity
  objectiveDataById: Map<string, EntityData>; // objective_id -> ObjectiveData entity
  minterRegistryById: Map<string, EntityData>; // minter_id -> MinterRegistryId entity
}

interface GameTokensState {
  // Core data
  gameTokens: Record<string, GameTokenData>; // tokenId -> GameTokenData
  relationshipMaps: RelationshipMaps;

  // Metadata
  isInitialized: boolean;
  lastUpdated: number;
  totalEntities: number;

  // Actions
  initializeStore: (entities: EntityData[]) => void;
  updateEntity: (entity: EntityData) => void;
  removeEntity: (entityId: string) => void;
  clearStore: () => void;
  refreshGameMetadata: () => void;

  // Getters
  getGameTokensByFilter: (filter: {
    owner?: string;
    gameAddresses?: string[];
    tokenIds?: string[];
    hasContext?: boolean;
    context?: {
      name?: string;
      attributes?: Record<string, any>;
    };
    settings_id?: number;
    completed_all_objectives?: boolean;
    soulbound?: boolean;
    objective_id?: string;
  }) => GameTokenData[];
  getGameTokenByTokenId: (tokenId: string) => GameTokenData | undefined;
}

const initialRelationshipMaps: RelationshipMaps = {
  objectiveToTokens: new Map(),
  settingsToTokens: new Map(),
  gameToTokens: new Map(),
  settingsDataById: new Map(),
  objectiveDataById: new Map(),
  minterRegistryById: new Map(),
};

export const useGameTokensStore = create<GameTokensState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gameTokens: {},
    relationshipMaps: initialRelationshipMaps,
    isInitialized: false,
    lastUpdated: 0,
    totalEntities: 0,

    // Initialize store with bulk data (like from initial query)
    initializeStore: (entities: EntityData[]) => {
      console.log('gameTokensStore: initializeStore called with', entities.length, 'entities');
      const { gameTokens, relationshipMaps } = buildMergedGamesFromEntities(entities);
      console.log('gameTokensStore: built', Object.keys(gameTokens).length, 'game tokens');
      console.log('gameTokensStore: sample game tokens:', Object.values(gameTokens).slice(0, 2));

      set({
        gameTokens,
        relationshipMaps,
        isInitialized: true,
        lastUpdated: Date.now(),
        totalEntities: entities.length,
      });
    },

    // Update individual entity (real-time updates)
    updateEntity: (entity: EntityData) => {
      const state = get();
      const { gameTokens, relationshipMaps } = state;

      // Special handling for MinterRegistryId - need to update all tokens minted by this minter
      if (entity.MinterRegistryId?.id) {
        const minterId = entity.MinterRegistryId.id.toString();
        const updatedGames = { ...gameTokens };
        const updatedMaps = { ...relationshipMaps };
        let hasUpdates = false;

        // Update relationship maps first
        updateRelationshipMaps(entity, updatedMaps);

        // Find all tokens that were minted by this minter and update their minted_by_address
        Object.keys(updatedGames).forEach((tokenId) => {
          const game = updatedGames[tokenId];
          if (game.minted_by && Number(minterId) === game.minted_by) {
            updatedGames[tokenId] = {
              ...game,
              minted_by_address: entity.MinterRegistryId!.contract_address,
            };
            hasUpdates = true;
          }
        });

        if (hasUpdates) {
          set({
            gameTokens: updatedGames,
            relationshipMaps: updatedMaps,
            lastUpdated: Date.now(),
          });
        }
        return;
      }

      // Find which token(s) this entity affects
      const affectedTokenIds = findAffectedTokenIds(entity, relationshipMaps);

      if (affectedTokenIds.length === 0) {
        console.warn('No affected tokens found for entity:', entity.entityId);
        return;
      }

      const updatedGames = { ...gameTokens };
      const updatedMaps = { ...relationshipMaps };

      // Update relationship maps first
      updateRelationshipMaps(entity, updatedMaps);

      // Update each affected token's merged data
      affectedTokenIds.forEach((tokenId) => {
        if (!updatedGames[tokenId]) {
          updatedGames[tokenId] = createEmptyMergedGame(tokenId);
        }

        updateMergedGameData(updatedGames[tokenId], entity, updatedMaps);
      });

      set({
        gameTokens: updatedGames,
        relationshipMaps: updatedMaps,
        lastUpdated: Date.now(),
      });
    },

    // Refresh gameMetadata for all tokens (called when mini games store updates)
    refreshGameMetadata: () => {
      const state = get();
      const { gameTokens } = state;
      const miniGamesStore = useMiniGamesStore.getState();

      const updatedGames = { ...gameTokens };
      let hasUpdates = false;

      // Update gameMetadata for all tokens that have a game_id
      Object.keys(updatedGames).forEach((tokenId) => {
        const game = updatedGames[tokenId];
        if (game.game_id) {
          const gameMetadata = miniGamesStore.getMiniGameData(game.game_id);
          if (gameMetadata) {
            updatedGames[tokenId] = {
              ...game,
              gameMetadata: {
                game_id: gameMetadata.game_id,
                contract_address: gameMetadata.contract_address,
                creator_token_id: gameMetadata.creator_token_id,
                name: gameMetadata.name,
                description: gameMetadata.description,
                developer: gameMetadata.developer,
                publisher: gameMetadata.publisher,
                genre: gameMetadata.genre,
                image: gameMetadata.image,
                color: gameMetadata.color,
              },
            };
            hasUpdates = true;
          }
        }
      });

      if (hasUpdates) {
        console.log('gameTokensStore: Refreshed gameMetadata for all tokens');
        set({
          gameTokens: updatedGames,
          lastUpdated: Date.now(),
        });
      }
    },

    // Remove entity
    removeEntity: (entityId: string) => {
      // Implementation for entity removal if needed
      console.log('Entity removal not yet implemented:', entityId);
    },

    // Clear all data
    clearStore: () => {
      set({
        gameTokens: {},
        relationshipMaps: {
          objectiveToTokens: new Map(),
          settingsToTokens: new Map(),
          gameToTokens: new Map(),
          settingsDataById: new Map(),
          objectiveDataById: new Map(),
          minterRegistryById: new Map(),
        },
        isInitialized: false,
        lastUpdated: 0,
        totalEntities: 0,
      });
    },

    // Get games by filter
    getGameTokensByFilter: (filter) => {
      const state = get();
      const games = Object.values(state.gameTokens);

      return games.filter((game) => {
        // Existing filters
        if (filter.owner && game.owner !== filter.owner) return false;
        if (
          filter.gameAddresses?.length &&
          !filter.gameAddresses.includes(game.gameMetadata?.contract_address || '')
        )
          return false;
        if (filter.tokenIds?.length && !filter.tokenIds.includes(game.token_id.toString()))
          return false;
        if (filter.hasContext !== undefined && !!game.context !== filter.hasContext) return false;

        // New context-based filtering
        if (filter.context) {
          if (!game.context) return false;

          // Filter by context name
          if (filter.context.name && game.context.name !== filter.context.name) return false;

          // Filter by context attributes
          if (filter.context.attributes && game.context.contexts) {
            const contextMatches = Object.entries(filter.context.attributes).every(
              ([key, value]) => {
                return game.context?.contexts && game.context.contexts[key] === value;
              }
            );
            if (!contextMatches) return false;
          }
        }

        // New filters
        if (filter.settings_id && game.settings_id !== filter.settings_id) return false;
        if (
          filter.completed_all_objectives !== undefined &&
          game.completed_all_objectives !== filter.completed_all_objectives
        )
          return false;
        if (filter.soulbound !== undefined && game.soulbound !== filter.soulbound) return false;
        if (filter.objective_id && !game.objective_ids?.includes(filter.objective_id)) return false;

        return true;
      });
    },

    // Get single game by token ID
    getGameTokenByTokenId: (tokenId) => {
      return get().gameTokens[tokenId];
    },
  }))
);

// Helper functions
function buildMergedGamesFromEntities(entities: EntityData[]): {
  gameTokens: Record<string, GameTokenData>;
  relationshipMaps: RelationshipMaps;
} {
  // Use existing mergeGameEntities logic but return both games and maps
  const relationshipMaps: RelationshipMaps = {
    objectiveToTokens: new Map(),
    settingsToTokens: new Map(),
    gameToTokens: new Map(),
    settingsDataById: new Map(),
    objectiveDataById: new Map(),
    minterRegistryById: new Map(),
  };

  // Build relationship maps
  entities.forEach((entity) => {
    updateRelationshipMaps(entity, relationshipMaps);
  });

  // ObjectiveData mapping still maintained for potential future use
  // console.log('Store: ObjectiveData entities stored:', relationshipMaps.objectiveDataById.size);

  // Group by token ID using the same logic as dataTransformers
  const groupedByToken = new Map<string, EntityData[]>();

  entities.forEach((entity) => {
    const tokenIds = findAffectedTokenIds(entity, relationshipMaps);

    tokenIds.forEach((tokenId) => {
      if (!groupedByToken.has(tokenId)) {
        groupedByToken.set(tokenId, []);
      }
      groupedByToken.get(tokenId)!.push(entity);
    });
  });

  // Create merged games
  const gameTokens: Record<string, GameTokenData> = {};

  groupedByToken.forEach((tokenEntities, tokenId) => {
    gameTokens[tokenId] = createMergedGameFromEntities(tokenId, tokenEntities, relationshipMaps);
  });

  return { gameTokens, relationshipMaps };
}

function findAffectedTokenIds(entity: EntityData, maps: RelationshipMaps): string[] {
  const tokenIds: string[] = [];

  // Direct token ID references
  if (entity.TokenMetadata?.id) {
    tokenIds.push(entity.TokenMetadata.id.toString());
  }
  if (entity.TokenObjective?.id) {
    tokenIds.push(entity.TokenObjective.id.toString());
  }
  if (entity.Owners?.token_id) {
    tokenIds.push(entity.Owners.token_id.toString());
  }
  if (entity.TokenPlayerName?.id) {
    tokenIds.push(entity.TokenPlayerName.id.toString());
  }
  if (entity.TokenContextData?.token_id) {
    tokenIds.push(entity.TokenContextData.token_id.toString());
  }
  if (entity.ScoreUpdate?.token_id) {
    tokenIds.push(entity.ScoreUpdate.token_id.toString());
  }
  if (entity.TokenRenderer?.id) {
    tokenIds.push(entity.TokenRenderer.id.toString());
  }
  if (entity.TokenClientUrl?.id) {
    tokenIds.push(entity.TokenClientUrl.id.toString());
  }

  // Relationship-based references
  if (entity.ObjectiveData?.objective_id) {
    const relatedTokenIds =
      maps.objectiveToTokens.get(entity.ObjectiveData.objective_id.toString()) || [];
    tokenIds.push(...relatedTokenIds);
  }

  if (entity.SettingsData?.settings_id) {
    const relatedTokenIds =
      maps.settingsToTokens.get(entity.SettingsData.settings_id.toString()) || [];
    tokenIds.push(...relatedTokenIds);
  }

  if (entity.GameRegistry?.id) {
    const relatedTokenIds = maps.gameToTokens.get(entity.GameRegistry.id.toString()) || [];
    tokenIds.push(...relatedTokenIds);
  }

  // For MinterRegistryId, we need to find all tokens that were minted by this minter
  // This requires checking all tokens in the store (less efficient but necessary)
  if (entity.MinterRegistryId?.id) {
    // We'll handle this in the updateEntity function by checking all tokens
    // For now, we'll return an empty array and let the store update handle it
    // This is because we need access to the current gameTokens to find matches
  }

  return [...new Set(tokenIds)]; // Remove duplicates
}

function updateRelationshipMaps(entity: EntityData, maps: RelationshipMaps): void {
  // Update objective mapping (one objective can have multiple tokens)
  if (entity.TokenObjective?.objective_id && entity.TokenObjective?.id) {
    const objectiveId = entity.TokenObjective.objective_id.toString();
    const tokenId = entity.TokenObjective.id.toString();

    if (!maps.objectiveToTokens.has(objectiveId)) {
      maps.objectiveToTokens.set(objectiveId, []);
    }

    const existingTokens = maps.objectiveToTokens.get(objectiveId)!;
    if (!existingTokens.includes(tokenId)) {
      existingTokens.push(tokenId);
    }
  }

  // Update settings mapping (one setting can have multiple tokens)
  if (entity.TokenMetadata?.settings_id && entity.TokenMetadata?.id) {
    const settingsId = entity.TokenMetadata.settings_id.toString();
    const tokenId = entity.TokenMetadata.id.toString();

    if (!maps.settingsToTokens.has(settingsId)) {
      maps.settingsToTokens.set(settingsId, []);
    }

    const existingTokens = maps.settingsToTokens.get(settingsId)!;
    if (!existingTokens.includes(tokenId)) {
      existingTokens.push(tokenId);
    }
  }

  // Update game mapping
  if (entity.TokenMetadata?.game_id && entity.TokenMetadata?.id) {
    const gameId = entity.TokenMetadata.game_id.toString();
    const tokenId = entity.TokenMetadata.id.toString();

    if (!maps.gameToTokens.has(gameId)) {
      maps.gameToTokens.set(gameId, []);
    }

    const existingTokens = maps.gameToTokens.get(gameId)!;
    if (!existingTokens.includes(tokenId)) {
      existingTokens.push(tokenId);
    }
  }

  // Store SettingsData entities by their settings_id
  if (entity.SettingsData?.settings_id) {
    maps.settingsDataById.set(entity.SettingsData.settings_id.toString(), entity);
  }

  // Store ObjectiveData entities by their objective_id
  if (entity.ObjectiveData?.objective_id) {
    maps.objectiveDataById.set(entity.ObjectiveData.objective_id.toString(), entity);
  }

  // Store MinterRegistryId entities by their id
  if (entity.MinterRegistryId?.id) {
    maps.minterRegistryById.set(entity.MinterRegistryId.id.toString(), entity);
  }
}

function createEmptyMergedGame(tokenId: string): GameTokenData {
  return {
    game_id: undefined,
    game_over: undefined,
    lifecycle: {
      start: undefined,
      end: undefined,
    },
    minted_at: undefined,
    minted_by: undefined,
    minted_by_address: undefined,
    owner: undefined,
    settings_id: undefined,
    soulbound: undefined,
    completed_all_objectives: undefined,
    token_id: Number(tokenId) || 0,
    player_name: undefined,
    metadata: undefined,
    context: undefined,
    settings: undefined,
    score: 0,
    objective_ids: [],
    renderer: undefined,
    client_url: undefined,
    gameMetadata: undefined,
  };
}

function createMergedGameFromEntities(
  tokenId: string,
  entities: EntityData[],
  relationshipMaps: RelationshipMaps
): GameTokenData {
  const merged = createEmptyMergedGame(tokenId);

  entities.forEach((entity) => {
    updateMergedGameData(merged, entity, relationshipMaps);
  });

  // Remove duplicates from arrays
  merged.objective_ids = [...new Set(merged.objective_ids)];

  return merged;
}

function updateMergedGameData(
  merged: GameTokenData,
  entity: EntityData,
  relationshipMaps?: RelationshipMaps
): void {
  // Same logic as in dataTransformers merging
  if (entity.TokenMetadata) {
    merged.game_id = Number(entity.TokenMetadata.game_id);
    merged.game_over = entity.TokenMetadata.game_over;
    merged.lifecycle = {
      start: Number(entity.TokenMetadata['lifecycle.start']) || undefined,
      end: Number(entity.TokenMetadata['lifecycle.end']) || undefined,
    };
    merged.minted_at = Number(entity.TokenMetadata.minted_at) || undefined;
    merged.minted_by = Number(entity.TokenMetadata.minted_by) || undefined;
    merged.settings_id = Number(entity.TokenMetadata.settings_id) || undefined;
    merged.soulbound = entity.TokenMetadata.soulbound;
    merged.completed_all_objectives = entity.TokenMetadata.completed_all_objectives;
    merged.metadata = entity.TokenMetadata.metadata;

    // Look up and include SettingsData if we have a settings_id
    if (entity.TokenMetadata.settings_id && relationshipMaps) {
      const settingsEntity = relationshipMaps.settingsDataById.get(
        entity.TokenMetadata.settings_id.toString()
      );
      if (settingsEntity?.SettingsData) {
        const rawSettings = settingsEntity.SettingsData.data || settingsEntity.SettingsData;
        const parsedSettings = parseSettingsData(rawSettings);
        merged.settings = {
          name: parsedSettings.name,
          description: parsedSettings.description,
          data: parsedSettings.data,
        };
      }
    }

    // Look up and include GameMetadata if we have a game_id
    if (entity.TokenMetadata.game_id) {
      const miniGamesStore = useMiniGamesStore.getState();
      const gameMetadata = miniGamesStore.getMiniGameData(entity.TokenMetadata.game_id);
      if (gameMetadata) {
        merged.gameMetadata = {
          game_id: gameMetadata.game_id,
          contract_address: gameMetadata.contract_address,
          creator_token_id: gameMetadata.creator_token_id,
          name: gameMetadata.name,
          description: gameMetadata.description,
          developer: gameMetadata.developer,
          publisher: gameMetadata.publisher,
          genre: gameMetadata.genre,
          image: gameMetadata.image,
          color: gameMetadata.color,
        };
      }
    }

    // Look up and include MinterRegistryId if we have a minted_by
    if (entity.TokenMetadata.minted_by && relationshipMaps) {
      const minterEntity = relationshipMaps.minterRegistryById.get(
        entity.TokenMetadata.minted_by.toString()
      );
      if (minterEntity?.MinterRegistryId) {
        merged.minted_by_address = minterEntity.MinterRegistryId.contract_address;
      }
    }
  }

  if (entity.Owners) {
    merged.owner = entity.Owners.owner || entity.Owners.owner_address;
    merged.token_id = Number(entity.Owners.token_id) || merged.token_id;
  }

  if (entity.TokenPlayerName) {
    const playerName = entity.TokenPlayerName.player_name || entity.TokenPlayerName.name;
    merged.player_name = feltToString(playerName) || undefined;
  }

  if (entity.TokenObjective) {
    const objectiveId = entity.TokenObjective.objective_id || entity.TokenObjective.id;
    if (objectiveId && !merged.objective_ids!.includes(objectiveId)) {
      merged.objective_ids!.push(objectiveId);

      // Store simplified approach: just store the objective_id
      // ObjectiveData lookup will be handled separately via the helper functions
    }
  }

  if (entity.ScoreUpdate) {
    merged.score = entity.ScoreUpdate.score || entity.ScoreUpdate.value || 0;
  }

  if (entity.TokenContextData) {
    const rawContext = entity.TokenContextData.data || entity.TokenContextData.context;

    // Parse context data to extract name, description, and contexts
    const parsedContext = parseContextData(rawContext);
    merged.context = {
      name: parsedContext.name,
      description: parsedContext.description,
      contexts: parsedContext.contexts,
    };
  }

  if (entity.SettingsData) {
    const rawSettings = entity.SettingsData.data || entity.SettingsData;
    const parsedSettings = parseSettingsData(rawSettings);
    merged.settings = {
      name: parsedSettings.name,
      description: parsedSettings.description,
      data: parsedSettings.data,
    };
  }

  // if (entity.GameRegistry) {
  //   merged.contract_address = entity.GameRegistry.contract_address || entity.GameRegistry.address;
  // }

  if (entity.TokenRenderer) {
    merged.renderer = entity.TokenRenderer.renderer_address;
  }

  if (entity.TokenClientUrl) {
    merged.client_url = entity.TokenClientUrl.client_url;
  }

  // Handle GameMetadata entities directly (when they come from mini games subscription)
  if (entity.GameMetadata) {
    // If this game token matches the GameMetadata game_id, update the gameMetadata
    if (merged.game_id && merged.game_id.toString() === entity.GameMetadata.id?.toString()) {
      merged.gameMetadata = {
        game_id: Number(entity.GameMetadata.id) || 0,
        contract_address: entity.GameMetadata.contract_address || '',
        creator_token_id: entity.GameMetadata.creator_token_id || '',
        name: feltToString(entity.GameMetadata.name) || '',
        description: entity.GameMetadata.description || '', // description is already a string
        developer: feltToString(entity.GameMetadata.developer) || '',
        publisher: feltToString(entity.GameMetadata.publisher) || '',
        genre: feltToString(entity.GameMetadata.genre) || '',
        image: entity.GameMetadata.image || '',
        color: entity.GameMetadata.color,
      };
    }
  }

  // Don't add ObjectiveData directly - it should only be added through TokenObjective lookup
  // The ObjectiveData will be added when processing TokenObjective entities above
}
