import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { feltToString, padAddress } from '../../shared/lib';
import type { GameTokenData, EntityData } from '../../shared/utils/dataTransformers';
import { parseContextData, parseSettingsData } from '../../shared/utils/dataTransformers';
import { useMiniGamesStore } from './miniGamesStore';
import { isDevelopment } from '../../shared/utils/env';
import { logger } from '../../shared/utils/logger';

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
    tokenIds?: number[];
    hasContext?: boolean;
    context?: {
      name?: string;
      attributes?: Record<string, unknown>;
    };
    settings_id?: number;
    completed_all_objectives?: boolean;
    soulbound?: boolean;
    objective_id?: string;
    minted_by_address?: string;
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
      logger.debug('gameTokensStore: initializeStore called with', entities.length, 'entities');

      // Debug: Log entity types distribution
      if (isDevelopment()) {
        const entityTypes: Record<string, number> = {};
        entities.forEach((entity) => {
          Object.keys(entity).forEach((key) => {
            if (key !== 'entityId' && entity[key]) {
              entityTypes[key] = (entityTypes[key] || 0) + 1;
            }
          });
        });
        logger.debug('gameTokensStore: Entity types distribution:', entityTypes);
      }

      const state = get();
      const existingTokens = state.gameTokens;

      const { gameTokens, relationshipMaps } = buildMergedGamesFromEntities(entities);
      logger.debug('gameTokensStore: built', Object.keys(gameTokens).length, 'game tokens');

      // Preserve existing metadata from tokens
      const mergedTokens = { ...gameTokens };

      Object.keys(mergedTokens).forEach((tokenId) => {
        const existingToken = existingTokens[tokenId];
        if (existingToken && existingToken.metadata !== undefined) {
          // Preserve the metadata from the existing token
          mergedTokens[tokenId] = {
            ...mergedTokens[tokenId],
            metadata: existingToken.metadata,
          };
          logger.debug(`gameTokensStore: Preserved metadata for token ${tokenId}`);
        }
      });

      // Debug: Log token ID mappings
      if (isDevelopment() && Object.keys(mergedTokens).length < 20) {
        logger.debug('gameTokensStore: Token ID -> token_id mappings:');
        Object.entries(mergedTokens).forEach(([key, token]) => {
          logger.debug(
            `  Key: ${key} -> token_id: ${token.token_id}, has metadata: ${token.metadata !== undefined}`
          );
        });
      }

      set({
        gameTokens: mergedTokens,
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

      // Check if this is a new token being added
      if (entity.TokenMetadataUpdate?.id) {
        const tokenId = entity.TokenMetadataUpdate.id.toString();
        const isNewToken = !gameTokens[tokenId];

        if (isNewToken) {
          logger.info(
            `New token detected: ${tokenId} - metadata will be fetched from token subscription`
          );
        }
      }

      // Special handling for MinterRegistryUpdate - need to update all tokens minted by this minter
      if (entity.MinterRegistryUpdate?.id) {
        const minterId = entity.MinterRegistryUpdate.id.toString();
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
              minted_by_address: entity.MinterRegistryUpdate!.minter_address,
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
        logger.warn('No affected tokens found for entity:', entity.entityId);
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

        // Preserve existing metadata before updating
        const existingMetadata = updatedGames[tokenId].metadata;

        updateMergedGameData(updatedGames[tokenId], entity, updatedMaps);

        // Restore metadata if it was overwritten (metadata comes from token subscription)
        if (existingMetadata !== undefined && updatedGames[tokenId].metadata === undefined) {
          updatedGames[tokenId].metadata = existingMetadata;
        }
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
                name: gameMetadata.name,
                description: gameMetadata.description,
                developer: gameMetadata.developer,
                publisher: gameMetadata.publisher,
                genre: gameMetadata.genre,
                image: gameMetadata.image,
                color: gameMetadata.color,
                client_url: gameMetadata.client_url,
                renderer_address: gameMetadata.renderer_address,
              },
            };
            hasUpdates = true;
          }
        }
      });

      if (hasUpdates) {
        logger.debug('gameTokensStore: Refreshed gameMetadata for all tokens');
        set({
          gameTokens: updatedGames,
          lastUpdated: Date.now(),
        });
      }
    },

    // Remove entity
    removeEntity: (entityId: string) => {
      // Implementation for entity removal if needed
      logger.debug('Entity removal not yet implemented:', entityId);
    },

    // Clear all data
    clearStore: () => {
      logger.info('[gameTokensStore] Clearing store data');
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
        if (filter.tokenIds?.length && !filter.tokenIds.includes(game.token_id)) return false;
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
        if (
          filter.minted_by_address &&
          game.minted_by_address !== padAddress(filter.minted_by_address)
        )
          return false;
        return true;
      });
    },

    // Get single game by token ID
    getGameTokenByTokenId: (tokenId) => {
      return get().gameTokens[tokenId];
    },
  }))
);

// Helper function to ensure consistent token ID formatting
// Currently unused but may be needed for future consistency
// function normalizeTokenId(tokenId: string | number | undefined): string {
//   if (tokenId === undefined || tokenId === null) return '';
//   return String(tokenId);
// }

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
  // logger.debug('Store: ObjectiveData entities stored:', relationshipMaps.objectiveDataById.size);

  // Group by token ID using the same logic as dataTransformers
  const groupedByToken = new Map<string, EntityData[]>();

  entities.forEach((entity) => {
    const tokenIds = findAffectedTokenIds(entity, relationshipMaps);

    if (isDevelopment() && tokenIds.length > 0) {
      // Log entity grouping for debugging
      const entityType = Object.keys(entity).find((key) => key !== 'entityId' && entity[key]);
      if (entityType === 'TokenMetadataUpdate' || entityType === 'OwnersUpdate') {
        logger.debug(`Entity ${entityType} affects tokens:`, tokenIds);
      }
    }

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
    if (isDevelopment()) {
      logger.debug(`\n=== Creating merged game for token ${tokenId} ===`);
      logger.debug(`Total entities for this token: ${tokenEntities.length}`);
      tokenEntities.forEach((entity) => {
        const entityType = Object.keys(entity).find((key) => key !== 'entityId' && entity[key]);
        if (entityType) {
          logger.debug(`- ${entityType}:`, entity[entityType]);
        }
      });
    }

    const mergedGame = createMergedGameFromEntities(tokenId, tokenEntities, relationshipMaps);

    // Validate that the token_id matches the key
    if (String(mergedGame.token_id) !== tokenId) {
      logger.warn(
        `Token ID mismatch: key=${tokenId}, token_id=${mergedGame.token_id}. Using key as token_id.`
      );
      mergedGame.token_id = Number(tokenId) || 0;
    }

    if (isDevelopment()) {
      logger.debug(`Final merged game for token ${tokenId}:`, {
        token_id: mergedGame.token_id,
        game_id: mergedGame.game_id,
        lifecycle: mergedGame.lifecycle,
        settings_id: mergedGame.settings_id,
        minted_at: mergedGame.minted_at,
      });
    }

    gameTokens[tokenId] = mergedGame;
  });

  return { gameTokens, relationshipMaps };
}

function findAffectedTokenIds(entity: EntityData, maps: RelationshipMaps): string[] {
  const tokenIds: string[] = [];

  // Handle TokenMetadata from token subscription
  if (entity.TokenMetadata?.id) {
    tokenIds.push(String(entity.TokenMetadata.id));
  }

  // Direct token ID references - use consistent String() conversion
  if (entity.TokenMetadataUpdate?.id) {
    tokenIds.push(String(entity.TokenMetadataUpdate.id));
  }
  if (entity.ObjectiveUpdate?.token_id) {
    tokenIds.push(String(entity.ObjectiveUpdate.token_id));
  }
  if (entity.OwnersUpdate?.token_id) {
    tokenIds.push(String(entity.OwnersUpdate.token_id));
  }
  if (entity.TokenPlayerNameUpdate?.id) {
    tokenIds.push(String(entity.TokenPlayerNameUpdate.id));
  }
  if (entity.TokenContextUpdate?.id) {
    tokenIds.push(String(entity.TokenContextUpdate.id));
  }
  if (entity.TokenScoreUpdate?.id) {
    tokenIds.push(String(entity.TokenScoreUpdate.id));
  }
  if (entity.TokenRendererUpdate?.id) {
    tokenIds.push(String(entity.TokenRendererUpdate.id));
  }
  if (entity.TokenClientUrlUpdate?.id) {
    tokenIds.push(String(entity.TokenClientUrlUpdate.id));
  }

  // Relationship-based references
  if (entity.ObjectiveCreated?.objective_id) {
    const relatedTokenIds =
      maps.objectiveToTokens.get(entity.ObjectiveCreated.objective_id.toString()) || [];
    tokenIds.push(...relatedTokenIds);
  }

  if (entity.SettingsCreated?.settings_id) {
    const relatedTokenIds =
      maps.settingsToTokens.get(entity.SettingsCreated.settings_id.toString()) || [];
    tokenIds.push(...relatedTokenIds);
  }

  if (entity.GameRegistryUpdate?.id) {
    const relatedTokenIds = maps.gameToTokens.get(entity.GameRegistryUpdate.id.toString()) || [];
    tokenIds.push(...relatedTokenIds);
  }

  // For MinterRegistryUpdate, we need to find all tokens that were minted by this minter
  // This requires checking all tokens in the store (less efficient but necessary)
  if (entity.MinterRegistryUpdate?.id) {
    // We'll handle this in the updateEntity function by checking all tokens
    // For now, we'll return an empty array and let the store update handle it
    // This is because we need access to the current gameTokens to find matches
  }

  return [...new Set(tokenIds)]; // Remove duplicates
}

function updateRelationshipMaps(entity: EntityData, maps: RelationshipMaps): void {
  // Update objective mapping (one objective can have multiple tokens)
  if (entity.ObjectiveUpdate?.objective_id && entity.ObjectiveUpdate?.token_id) {
    const objectiveId = String(entity.ObjectiveUpdate.objective_id);
    const tokenId = String(entity.ObjectiveUpdate.token_id);

    if (!maps.objectiveToTokens.has(objectiveId)) {
      maps.objectiveToTokens.set(objectiveId, []);
    }

    const existingTokens = maps.objectiveToTokens.get(objectiveId)!;
    if (!existingTokens.includes(tokenId)) {
      existingTokens.push(tokenId);
    }
  }

  // Update settings mapping (one setting can have multiple tokens)
  if (entity.TokenMetadataUpdate?.settings_id && entity.TokenMetadataUpdate?.id) {
    const settingsId = entity.TokenMetadataUpdate.settings_id.toString();
    const tokenId = entity.TokenMetadataUpdate.id.toString();

    if (!maps.settingsToTokens.has(settingsId)) {
      maps.settingsToTokens.set(settingsId, []);
    }

    const existingTokens = maps.settingsToTokens.get(settingsId)!;
    if (!existingTokens.includes(tokenId)) {
      existingTokens.push(tokenId);
    }
  }

  // Update game mapping
  if (entity.TokenMetadataUpdate?.game_id && entity.TokenMetadataUpdate?.id) {
    const gameId = entity.TokenMetadataUpdate.game_id.toString();
    const tokenId = entity.TokenMetadataUpdate.id.toString();

    if (!maps.gameToTokens.has(gameId)) {
      maps.gameToTokens.set(gameId, []);
    }

    const existingTokens = maps.gameToTokens.get(gameId)!;
    if (!existingTokens.includes(tokenId)) {
      existingTokens.push(tokenId);
    }
  }

  // Store SettingsCreated entities by their settings_id
  if (entity.SettingsCreated?.settings_id) {
    maps.settingsDataById.set(entity.SettingsCreated.settings_id.toString(), entity);
  }

  // Store ObjectiveCreated entities by their objective_id
  if (entity.ObjectiveCreated?.objective_id) {
    maps.objectiveDataById.set(entity.ObjectiveCreated.objective_id.toString(), entity);
  }

  // Store MinterRegistryUpdate entities by their id
  if (entity.MinterRegistryUpdate?.id) {
    maps.minterRegistryById.set(entity.MinterRegistryUpdate.id.toString(), entity);
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

  // Sort entities to process TokenMetadataUpdate last to ensure it has priority
  const sortedEntities = [...entities].sort((a, b) => {
    const aHasTokenMetadata = !!a.TokenMetadataUpdate;
    const bHasTokenMetadata = !!b.TokenMetadataUpdate;
    if (aHasTokenMetadata && !bHasTokenMetadata) return 1;
    if (!aHasTokenMetadata && bHasTokenMetadata) return -1;

    // If both have TokenMetadataUpdate, sort by minted_at (newer last)
    if (aHasTokenMetadata && bHasTokenMetadata) {
      const aMintedAt = Number(a.TokenMetadataUpdate!.minted_at) || 0;
      const bMintedAt = Number(b.TokenMetadataUpdate!.minted_at) || 0;
      return aMintedAt - bMintedAt;
    }

    return 0;
  });

  sortedEntities.forEach((entity) => {
    // Log each entity being processed for this token
    if (isDevelopment()) {
      const entityType = Object.keys(entity).find((key) => key !== 'entityId' && entity[key]);
      logger.debug(`Processing ${entityType} for token ${tokenId}:`, entity);
    }
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
  // Handle token metadata from token subscription
  if (entity.TokenMetadata) {
    merged.metadata = entity.TokenMetadata.metadata;
    // Also update token_id if needed
    if (entity.TokenMetadata.id) {
      merged.token_id = Number(entity.TokenMetadata.id);
    }
    logger.debug(`Applied TokenMetadata for token ${merged.token_id}`);
  }

  // Same logic as in dataTransformers merging
  if (entity.TokenMetadataUpdate) {
    // Log if we're processing a TokenMetadataUpdate
    if (isDevelopment()) {
      logger.debug(`Processing TokenMetadataUpdate for token ${entity.TokenMetadataUpdate.id}:`, {
        game_id: entity.TokenMetadataUpdate.game_id,
        minted_at: entity.TokenMetadataUpdate.minted_at,
        lifecycle_start: entity.TokenMetadataUpdate.lifecycle_start,
        lifecycle_end: entity.TokenMetadataUpdate.lifecycle_end,
        soulbound: entity.TokenMetadataUpdate.soulbound,
      });
    }
    merged.game_id = Number(entity.TokenMetadataUpdate.game_id);
    merged.game_over = entity.TokenMetadataUpdate.game_over;
    // Debug lifecycle parsing
    const lifecycleStart =
      entity.TokenMetadataUpdate.lifecycle_start || entity.TokenMetadataUpdate['lifecycle.start'];
    const lifecycleEnd =
      entity.TokenMetadataUpdate.lifecycle_end || entity.TokenMetadataUpdate['lifecycle.end'];

    if (isDevelopment()) {
      logger.debug(`TokenMetadataUpdate lifecycle parsing for token ${merged.token_id}:`, {
        raw_entity: entity.TokenMetadataUpdate,
        lifecycle_start: entity.TokenMetadataUpdate.lifecycle_start,
        lifecycle_end: entity.TokenMetadataUpdate.lifecycle_end,
        'lifecycle.start': entity.TokenMetadataUpdate['lifecycle.start'],
        'lifecycle.end': entity.TokenMetadataUpdate['lifecycle.end'],
        parsedStart: lifecycleStart,
        parsedEnd: lifecycleEnd,
        willSetStart: lifecycleStart ? Number(lifecycleStart) : undefined,
        willSetEnd: lifecycleEnd ? Number(lifecycleEnd) : undefined,
      });
    }

    // Ensure proper conversion of lifecycle values
    const startValue = lifecycleStart ? Number(lifecycleStart) : undefined;
    const endValue = lifecycleEnd ? Number(lifecycleEnd) : undefined;

    merged.lifecycle = {
      start: startValue,
      end: endValue,
    };

    if (isDevelopment()) {
      logger.debug(`Set lifecycle for token ${merged.token_id}:`, merged.lifecycle);
    }
    merged.minted_at = Number(entity.TokenMetadataUpdate.minted_at) || undefined;
    merged.minted_by = Number(entity.TokenMetadataUpdate.minted_by) || undefined;
    merged.settings_id =
      entity.TokenMetadataUpdate.settings_id !== undefined
        ? Number(entity.TokenMetadataUpdate.settings_id)
        : undefined;
    merged.soulbound = entity.TokenMetadataUpdate.soulbound;
    merged.completed_all_objectives = entity.TokenMetadataUpdate.completed_all_objectives;
    // TokenMetadataUpdate doesn't have a metadata field in Cairo events
    // Don't overwrite metadata - it comes from token subscription

    // Look up and include SettingsData if we have a settings_id
    if (entity.TokenMetadataUpdate.settings_id && relationshipMaps) {
      const settingsEntity = relationshipMaps.settingsDataById.get(
        entity.TokenMetadataUpdate.settings_id.toString()
      );
      if (settingsEntity?.SettingsCreated) {
        const rawSettings = settingsEntity.SettingsCreated.settings_data;
        const parsedSettings = parseSettingsData(rawSettings);
        merged.settings = {
          name: parsedSettings.name,
          description: parsedSettings.description,
          data: parsedSettings.data,
        };
      }
    }

    // Look up and include GameMetadata if we have a game_id
    if (entity.TokenMetadataUpdate.game_id) {
      const miniGamesStore = useMiniGamesStore.getState();
      const gameMetadata = miniGamesStore.getMiniGameData(entity.TokenMetadataUpdate.game_id);
      if (gameMetadata) {
        merged.gameMetadata = {
          game_id: gameMetadata.game_id,
          contract_address: gameMetadata.contract_address,
          name: gameMetadata.name,
          description: gameMetadata.description,
          developer: gameMetadata.developer,
          publisher: gameMetadata.publisher,
          genre: gameMetadata.genre,
          image: gameMetadata.image,
          color: gameMetadata.color,
          client_url: gameMetadata.client_url,
          renderer_address: gameMetadata.renderer_address,
        };
      }
    }

    // Look up and include MinterRegistryId if we have a minted_by
    if (entity.TokenMetadataUpdate.minted_by && relationshipMaps) {
      const minterEntity = relationshipMaps.minterRegistryById.get(
        entity.TokenMetadataUpdate.minted_by.toString()
      );
      if (minterEntity?.MinterRegistryUpdate) {
        merged.minted_by_address = minterEntity.MinterRegistryUpdate.minter_address;
      }
    }
  }

  if (entity.OwnersUpdate) {
    merged.owner = entity.OwnersUpdate.owner;
    // Don't overwrite token_id - it's already set from the tokenId parameter
  }

  if (entity.TokenPlayerNameUpdate) {
    const playerName = entity.TokenPlayerNameUpdate.player_name;
    merged.player_name = feltToString(playerName) || undefined;
  }

  if (entity.ObjectiveUpdate) {
    const objectiveId = entity.ObjectiveUpdate.objective_id;
    if (objectiveId && !merged.objective_ids!.includes(String(objectiveId))) {
      merged.objective_ids!.push(String(objectiveId));

      // Store simplified approach: just store the objective_id
      // ObjectiveData lookup will be handled separately via the helper functions
    }
  }

  if (entity.TokenScoreUpdate) {
    merged.score = Number(entity.TokenScoreUpdate.score) || 0;
  }

  if (entity.TokenContextUpdate) {
    const rawContext = entity.TokenContextUpdate.context_data;

    // Parse context data to extract name, description, and contexts
    const parsedContext = parseContextData(rawContext);
    merged.context = {
      name: parsedContext.name,
      description: parsedContext.description,
      contexts: parsedContext.contexts,
    };
  }

  if (entity.SettingsCreated) {
    const rawSettings = entity.SettingsCreated.settings_data;
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

  if (entity.TokenRendererUpdate) {
    merged.renderer = entity.TokenRendererUpdate.renderer_address;
  }

  if (entity.TokenClientUrlUpdate) {
    merged.client_url = entity.TokenClientUrlUpdate.client_url;
  }

  // Handle GameMetadata entities directly (when they come from mini games subscription)
  if (entity.GameMetadataUpdate) {
    // If this game token matches the GameMetadata game_id, update the gameMetadata
    if (merged.game_id && merged.game_id.toString() === entity.GameMetadataUpdate.id?.toString()) {
      merged.gameMetadata = {
        game_id: Number(entity.GameMetadataUpdate.id) || 0,
        contract_address: entity.GameMetadataUpdate.contract_address || '',
        name: feltToString(entity.GameMetadataUpdate.name) || '',
        description: entity.GameMetadataUpdate.description || '', // description is already a string
        developer: feltToString(entity.GameMetadataUpdate.developer) || '',
        publisher: feltToString(entity.GameMetadataUpdate.publisher) || '',
        genre: feltToString(entity.GameMetadataUpdate.genre) || '',
        image: entity.GameMetadataUpdate.image || '',
        color: entity.GameMetadataUpdate.color,
        client_url: entity.GameMetadataUpdate.client_url,
        renderer_address: entity.GameMetadataUpdate.renderer_address,
      };
    }
  }

  // Don't add ObjectiveData directly - it should only be added through TokenObjective lookup
  // The ObjectiveData will be added when processing TokenObjective entities above
}
