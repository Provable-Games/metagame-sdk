import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { feltToString } from '../../shared/lib';
import type { GameTokenData, EntityData } from '../../shared/utils/dataTransformers';

interface RelationshipMaps {
  objectiveToTokens: Map<string, string[]>; // objective_id -> array of token_ids
  settingsToTokens: Map<string, string[]>; // settings_id -> array of token_ids
  gameToTokens: Map<string, string[]>;
  // Reverse lookups for data entities
  settingsDataById: Map<string, EntityData>; // settings_id -> SettingsData entity
  objectiveDataById: Map<string, EntityData>; // objective_id -> ObjectiveData entity
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

  // Getters
  getGameTokensByFilter: (filter: {
    owner?: string;
    gameAddresses?: string[];
    tokenIds?: string[];
    hasContext?: boolean;
  }) => GameTokenData[];
  getGameTokenByTokenId: (tokenId: string) => GameTokenData | undefined;
}

const initialRelationshipMaps: RelationshipMaps = {
  objectiveToTokens: new Map(),
  settingsToTokens: new Map(),
  gameToTokens: new Map(),
  settingsDataById: new Map(),
  objectiveDataById: new Map(),
};

export const useMergedGamesStore = create<GameTokensState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gameTokens: {},
    relationshipMaps: initialRelationshipMaps,
    isInitialized: false,
    lastUpdated: 0,
    totalEntities: 0,

    // Initialize store with bulk data (like from initial query)
    initializeStore: (entities: EntityData[]) => {
      console.log('mergedGamesStore: initializeStore called with', entities.length, 'entities');
      const { gameTokens, relationshipMaps } = buildMergedGamesFromEntities(entities);
      console.log('mergedGamesStore: built', Object.keys(gameTokens).length, 'game tokens');
      console.log('mergedGamesStore: sample game tokens:', Object.values(gameTokens).slice(0, 2));

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
        if (filter.owner && game.owner !== filter.owner) return false;
        if (
          filter.gameAddresses?.length &&
          !filter.gameAddresses.includes(game.contract_address || '')
        )
          return false;
        if (filter.tokenIds?.length && !filter.tokenIds.includes(game.token_id || '')) return false;
        if (filter.hasContext !== undefined && !!game.context !== filter.hasContext) return false;
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
}

function createEmptyMergedGame(tokenId: string): GameTokenData {
  return {
    contract_address: undefined,
    game_id: undefined,
    game_over: undefined,
    lifecycle: {
      start: undefined,
      end: undefined,
    },
    minted_at: undefined,
    minted_by: undefined,
    owner: undefined,
    settings_id: undefined,
    soulbound: undefined,
    completed_all_objectives: undefined,
    token_id: tokenId,
    player_name: undefined,
    metadata: undefined,
    context: undefined,
    settings_data: undefined,
    score: 0,
    objective_ids: [],
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
    merged.game_id = entity.TokenMetadata.game_id;
    merged.game_over = entity.TokenMetadata.game_over;
    merged.lifecycle = {
      start: entity.TokenMetadata['lifecycle.start'],
      end: entity.TokenMetadata['lifecycle.end'],
    };
    merged.minted_at = entity.TokenMetadata.minted_at;
    merged.minted_by = entity.TokenMetadata.minted_by;
    merged.settings_id = entity.TokenMetadata.settings_id?.toString();
    merged.soulbound = entity.TokenMetadata.soulbound;
    merged.completed_all_objectives = entity.TokenMetadata.completed_all_objectives;
    merged.metadata = entity.TokenMetadata.metadata;

    // Look up and include SettingsData if we have a settings_id
    if (entity.TokenMetadata.settings_id && relationshipMaps) {
      const settingsEntity = relationshipMaps.settingsDataById.get(
        entity.TokenMetadata.settings_id.toString()
      );
      if (settingsEntity?.SettingsData) {
        merged.settings_data = settingsEntity.SettingsData.data || settingsEntity.SettingsData;
      }
    }
  }

  if (entity.Owners) {
    merged.owner = entity.Owners.owner || entity.Owners.owner_address;
    merged.token_id = entity.Owners.token_id?.toString() || merged.token_id;
  }

  if (entity.TokenPlayerName) {
    const playerName = entity.TokenPlayerName.player_name || entity.TokenPlayerName.name;
    merged.player_name = feltToString(playerName);
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
    merged.context = entity.TokenContextData.data || entity.TokenContextData.context;
  }

  if (entity.SettingsData) {
    merged.settings_data = entity.SettingsData.data || entity.SettingsData;
  }

  if (entity.GameRegistry) {
    merged.contract_address = entity.GameRegistry.contract_address || entity.GameRegistry.address;
  }

  // Don't add ObjectiveData directly - it should only be added through TokenObjective lookup
  // The ObjectiveData will be added when processing TokenObjective entities above
}
