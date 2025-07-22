import { feltToString } from '../lib';
import type { GameTokenData, GameMetadata, GameSettings, GameObjective } from '../types';
import type { EntityData } from '../types/entities';

// Re-export from shared types for consistency
export type { GameTokenData, GameMetadata, GameSettings, GameObjective, EntityData };

// New interface for objectives lookup
export interface ObjectiveLookup {
  objective_id: string;
  data: string;
}

// Helper function to get objectives for a token
export const getObjectivesForToken = (
  tokenId: string,
  entities: EntityData[]
): ObjectiveLookup[] => {
  const objectives: ObjectiveLookup[] = [];

  entities.forEach((entity) => {
    if (entity.ObjectiveUpdate && entity.ObjectiveUpdate.token_id === tokenId) {
      const objectiveId = entity.ObjectiveUpdate.objective_id;

      // Find the corresponding ObjectiveCreated
      const objectiveData = entities.find(
        (e) => e.ObjectiveCreated && e.ObjectiveCreated.objective_id === objectiveId
      );

      if (objectiveData?.ObjectiveCreated) {
        objectives.push({
          objective_id: String(objectiveId),
          data: objectiveData.ObjectiveCreated.objective_data || '',
        });
      }
    }
  });

  return objectives;
};

// Helper function to get settings for a token
export const getSettingsForToken = (
  settingsId: string,
  entities: EntityData[]
): { name: string; description: string; data: any } | undefined => {
  const settingsEntity = entities.find(
    (entity) => entity.SettingsCreated && entity.SettingsCreated.settings_id === settingsId
  );

  if (settingsEntity?.SettingsCreated) {
    const rawSettings = settingsEntity.SettingsCreated.settings_data;
    return parseSettingsData(rawSettings);
  }

  return undefined;
};

// Helper function to get game metadata for a token
export const getGameMetadataForToken = (
  gameId: string,
  entities: EntityData[]
): GameMetadata | undefined => {
  const gameEntity = entities.find(
    (entity) => entity.GameMetadataUpdate && entity.GameMetadataUpdate.id === gameId
  );

  if (gameEntity?.GameMetadataUpdate) {
    return {
      game_id: Number(gameEntity.GameMetadataUpdate.id) || 0,
      contract_address: gameEntity.GameMetadataUpdate.contract_address || '',
      name: feltToString(gameEntity.GameMetadataUpdate.name) || '',
      description: gameEntity.GameMetadataUpdate.description || '',
      developer: feltToString(gameEntity.GameMetadataUpdate.developer) || '',
      publisher: feltToString(gameEntity.GameMetadataUpdate.publisher) || '',
      genre: feltToString(gameEntity.GameMetadataUpdate.genre) || '',
      image: gameEntity.GameMetadataUpdate.image || '',
      color: gameEntity.GameMetadataUpdate.color,
      client_url: gameEntity.GameMetadataUpdate.client_url,
      renderer_address: gameEntity.GameMetadataUpdate.renderer_address,
    };
  }

  return undefined;
};

// Helper function to get objectives data by objective ID
export const getObjectiveDataById = (objectiveId: string, entities: EntityData[]): string => {
  const objectiveEntity = entities.find(
    (entity) => entity.ObjectiveCreated && entity.ObjectiveCreated.objective_id === objectiveId
  );

  return objectiveEntity?.ObjectiveCreated?.objective_data || '';
};

export const parseContextData = (
  rawContext: any
): { name: string; description: string; contexts: any } => {
  if (!rawContext) {
    return { name: '', description: '', contexts: {} };
  }

  try {
    let name = '';
    let description = '';
    let contexts: any = {};

    // If it's already an object, use it directly
    if (typeof rawContext === 'object' && rawContext !== null) {
      name = rawContext.Name || rawContext.name || '';
      description = rawContext.Description || rawContext.description || '';
      // Prefer .contexts if present, else use the object itself
      contexts = rawContext.contexts || rawContext;
    } else if (typeof rawContext === 'string') {
      const parsed = JSON.parse(rawContext);
      name = parsed.Name || parsed.name || '';
      description = parsed.Description || parsed.description || '';
      contexts = parsed.contexts || parsed;
    } else {
      contexts = rawContext;
    }

    // Unwrap Contexts key if present
    if (contexts.Contexts && typeof contexts.Contexts === 'object') {
      contexts = contexts.Contexts;
    }

    // Remove name/description keys from contexts if present
    if (typeof contexts === 'object' && contexts !== null) {
      const { name, Name, description, Description, ...rest } = contexts;
      contexts = rest;
    }

    return { name, description, contexts };
  } catch (error) {
    console.warn('Failed to parse context data:', error);
    return { name: '', description: '', contexts: {} };
  }
};

export const parseSettingsData = (
  rawSettings: any
): { name: string; description: string; data: any } => {
  if (!rawSettings) {
    return { name: '', description: '', data: {} };
  }

  try {
    // If it's already an object, use it directly
    if (typeof rawSettings === 'object' && rawSettings !== null) {
      return {
        name: rawSettings.Name || rawSettings.name || '',
        description: rawSettings.Description || rawSettings.description || '',
        data: rawSettings.data || rawSettings.Settings || rawSettings,
      };
    }

    // If it's a string, try to parse it as JSON
    if (typeof rawSettings === 'string') {
      const parsed = JSON.parse(rawSettings);
      return {
        name: parsed.Name || parsed.name || '',
        description: parsed.Description || parsed.description || '',
        data: parsed.data || parsed.Settings || parsed,
      };
    }

    // Fallback
    return { name: '', description: '', data: rawSettings };
  } catch (error) {
    console.warn('Failed to parse settings data:', error);
    return { name: '', description: '', data: {} };
  }
};

// Transform a single entity into a GameTokenData object
export const transformEntityToGameToken = (
  tokenId: string,
  entities: EntityData[]
): GameTokenData => {
  const tokenEntities = entities.filter((entity) => {
    return (
      (entity.TokenMetadataUpdate && entity.TokenMetadataUpdate.id === tokenId) ||
      (entity.OwnersUpdate && entity.OwnersUpdate.token_id === tokenId) ||
      (entity.TokenPlayerNameUpdate && entity.TokenPlayerNameUpdate.id === tokenId) ||
      (entity.ObjectiveUpdate && entity.ObjectiveUpdate.token_id === tokenId) ||
      (entity.TokenContextUpdate && entity.TokenContextUpdate.id === tokenId) ||
      (entity.TokenScoreUpdate && entity.TokenScoreUpdate.id === tokenId) ||
      (entity.TokenRendererUpdate && entity.TokenRendererUpdate.id === tokenId) ||
      (entity.TokenClientUrlUpdate && entity.TokenClientUrlUpdate.id === tokenId)
    );
  });

  const merged: GameTokenData = {
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

  tokenEntities.forEach((entity) => {
    if (entity.TokenMetadataUpdate) {
      merged.game_id = Number(entity.TokenMetadataUpdate.game_id);
      merged.game_over = entity.TokenMetadataUpdate.game_over;
      // Debug lifecycle parsing
      const lifecycleStart = entity.TokenMetadataUpdate.lifecycle_start || entity.TokenMetadataUpdate['lifecycle.start'];
      const lifecycleEnd = entity.TokenMetadataUpdate.lifecycle_end || entity.TokenMetadataUpdate['lifecycle.end'];
      
      console.log(`dataTransformers: Processing lifecycle for token ${tokenId}:`, {
        lifecycle_start: entity.TokenMetadataUpdate.lifecycle_start,
        lifecycle_end: entity.TokenMetadataUpdate.lifecycle_end,
        'lifecycle.start': entity.TokenMetadataUpdate['lifecycle.start'],
        'lifecycle.end': entity.TokenMetadataUpdate['lifecycle.end'],
        parsedStart: lifecycleStart,
        parsedEnd: lifecycleEnd,
      });
      
      merged.lifecycle = {
        start: lifecycleStart ? Number(lifecycleStart) : undefined,
        end: lifecycleEnd ? Number(lifecycleEnd) : undefined,
      };
      merged.minted_at = Number(entity.TokenMetadataUpdate.minted_at) || undefined;
      merged.minted_by = Number(entity.TokenMetadataUpdate.minted_by) || undefined;
      merged.settings_id = entity.TokenMetadataUpdate.settings_id !== undefined ? Number(entity.TokenMetadataUpdate.settings_id) : undefined;
      merged.soulbound = entity.TokenMetadataUpdate.soulbound;
      merged.completed_all_objectives = entity.TokenMetadataUpdate.completed_all_objectives;
      // TokenMetadataUpdate doesn't have a metadata field in Cairo events

      // Get settings data if settings_id exists
      if (entity.TokenMetadataUpdate.settings_id) {
        merged.settings = getSettingsForToken(
          String(entity.TokenMetadataUpdate.settings_id),
          entities
        );
      }

      // Get game metadata if game_id exists
      if (entity.TokenMetadataUpdate.game_id) {
        merged.gameMetadata = getGameMetadataForToken(
          String(entity.TokenMetadataUpdate.game_id),
          entities
        );
      }

      // Get minter address if minted_by exists
      if (entity.TokenMetadataUpdate.minted_by) {
        const minterEntity = entities.find(
          (e) =>
            e.MinterRegistryUpdate?.id &&
            Number(e.MinterRegistryUpdate.id) === Number(entity.TokenMetadataUpdate!.minted_by)
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
      merged.player_name = feltToString(playerName);
    }

    if (entity.ObjectiveUpdate) {
      const objectiveId = entity.ObjectiveUpdate.objective_id;
      if (objectiveId && !merged.objective_ids!.includes(String(objectiveId))) {
        merged.objective_ids!.push(String(objectiveId));
      }
    }

    if (entity.TokenScoreUpdate) {
      merged.score = Number(entity.TokenScoreUpdate.score) || 0;
    }

    if (entity.TokenContextUpdate) {
      const rawContext = entity.TokenContextUpdate.context_data;
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

    if (entity.TokenRendererUpdate) {
      merged.renderer = entity.TokenRendererUpdate.renderer_address;
    }

    if (entity.TokenClientUrlUpdate) {
      merged.client_url = entity.TokenClientUrlUpdate.client_url;
    }

    // Merge MinterRegistryUpdate to populate minted_by_address
    if (entity.MinterRegistryUpdate && merged.minted_by) {
      if (Number(entity.MinterRegistryUpdate.id) === merged.minted_by) {
        merged.minted_by_address = entity.MinterRegistryUpdate.minter_address;
      }
    }
  });

  // Remove duplicates from arrays
  merged.objective_ids = [...new Set(merged.objective_ids)];

  return merged;
};

// Transform multiple entities into GameTokenData objects
export const transformEntitiesToGameTokens = (
  entities: EntityData[]
): Record<string, GameTokenData> => {
  const gameTokens: Record<string, GameTokenData> = {};

  // Get all unique token IDs
  const tokenIds = new Set<string>();

  entities.forEach((entity) => {
    if (entity.TokenMetadataUpdate?.id) tokenIds.add(entity.TokenMetadataUpdate.id.toString());
    if (entity.OwnersUpdate?.token_id) tokenIds.add(entity.OwnersUpdate.token_id.toString());
    if (entity.TokenPlayerNameUpdate?.id) tokenIds.add(entity.TokenPlayerNameUpdate.id.toString());
    if (entity.ObjectiveUpdate?.token_id) tokenIds.add(entity.ObjectiveUpdate.token_id.toString());
    if (entity.TokenContextUpdate?.id)
      tokenIds.add(entity.TokenContextUpdate.id.toString());
    if (entity.TokenScoreUpdate?.id) tokenIds.add(entity.TokenScoreUpdate.id.toString());
    if (entity.TokenRendererUpdate?.id) tokenIds.add(entity.TokenRendererUpdate.id.toString());
    if (entity.TokenClientUrlUpdate?.id) tokenIds.add(entity.TokenClientUrlUpdate.id.toString());
  });

  // Transform each token
  tokenIds.forEach((tokenId) => {
    gameTokens[tokenId] = transformEntityToGameToken(tokenId, entities);
  });

  return gameTokens;
};

// New interface for the complete result
export interface GameTokenResult {
  gameTokens: GameTokenData[];
  objectivesLookup: Record<string, { data: string; game_id: any }>;
}

// Build objectives lookup table from entities
export function buildObjectivesLookup(
  entities: EntityData[]
): Record<string, { data: string; game_id: any }> {
  const lookup: Record<string, { data: string; game_id: any }> = {};

  entities.forEach((entity) => {
    if (entity.ObjectiveCreated?.objective_id) {
      const objectiveId = String(entity.ObjectiveCreated.objective_id);
      lookup[objectiveId] = {
        data: entity.ObjectiveCreated.objective_data || '',
        game_id: entity.ObjectiveCreated.game_address,
      };
    }
  });

  console.log('Built objectives lookup:', lookup);
  return lookup;
}

// Build mini games lookup table from entities
export function buildMiniGamesLookup(
  entities: EntityData[]
): Record<string, GameTokenData['gameMetadata']> {
  const lookup: Record<string, GameTokenData['gameMetadata']> = {};

  entities.forEach((entity) => {
    if (entity.GameMetadataUpdate?.id && entity.GameMetadataUpdate?.contract_address) {
      const gameId = String(entity.GameMetadataUpdate.id);
      lookup[gameId] = {
        game_id: Number(entity.GameMetadataUpdate.id) || 0,
        contract_address: entity.GameMetadataUpdate.contract_address,
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
    }
  });

  console.log('Built mini games lookup:', lookup);
  return lookup;
}

// Helper function to get objectives data for a game
export function getObjectivesForGame(
  game: GameTokenData,
  objectivesLookup: Record<string, { data: string; game_id: any }>
): string[] {
  if (!game.objective_ids || game.objective_ids.length === 0) {
    return [];
  }

  return game.objective_ids
    .map((objectiveId) => {
      const objective = objectivesLookup[objectiveId];
      // Filter by game_id to prevent cross-game contamination
      if (objective && objective.game_id?.toString() === game.game_id?.toString()) {
        return objective.data;
      }
      return null;
    })
    .filter(Boolean) as string[];
}

export function mergeGameEntities(
  entities: EntityData[],
  miniGamesLookup?: Record<string, GameTokenData['gameMetadata']>
): GameTokenResult {
  // Build objectives lookup first
  const objectivesLookup = buildObjectivesLookup(entities);

  // Build mini games lookup if not provided
  if (!miniGamesLookup) {
    miniGamesLookup = buildMiniGamesLookup(entities);
  }

  // Group entities by token_id for merging (similar to SQL GROUP BY)
  const groupedByToken = new Map<string, EntityData[]>();

  // Create mapping tables for relationships (similar to SQL foreign keys)
  const objectiveToTokens = new Map<string, string>();
  const settingsToTokens = new Map<string, string>();
  const gameToTokens = new Map<string, string[]>();

  console.log('Building relationship mappings...');

  // Build relationship mappings
  entities.forEach((entity) => {
    // Map objective_id to token_id (1:1 relationship)
    if (entity.ObjectiveUpdate?.objective_id && entity.ObjectiveUpdate?.token_id) {
      objectiveToTokens.set(
        String(entity.ObjectiveUpdate.objective_id),
        String(entity.ObjectiveUpdate.token_id)
      );
    }

    // Map settings_id to token_id (1:1 relationship)
    if (entity.TokenMetadataUpdate?.settings_id && entity.TokenMetadataUpdate?.id) {
      const settingsId = String(entity.TokenMetadataUpdate.settings_id);
      const tokenId = String(entity.TokenMetadataUpdate.id);
      settingsToTokens.set(settingsId, tokenId);
    }

    // Map game_id to multiple token_ids (1:many relationship)
    if (entity.TokenMetadataUpdate?.game_id && entity.TokenMetadataUpdate?.id) {
      const gameId = String(entity.TokenMetadataUpdate.game_id);
      const tokenId = String(entity.TokenMetadataUpdate.id);

      if (!gameToTokens.has(gameId)) {
        gameToTokens.set(gameId, []);
      }
      if (!gameToTokens.get(gameId)!.includes(tokenId)) {
        gameToTokens.get(gameId)!.push(tokenId);
      }
    }
  });

  console.log('Objective to Token mappings:', Object.fromEntries(objectiveToTokens));
  console.log('Settings to Token mappings:', Object.fromEntries(settingsToTokens));
  console.log('Game to Tokens mappings:', Object.fromEntries(gameToTokens));

  // Group entities by their related token_ids
  entities.forEach((entity) => {
    const relatedTokenIds = new Set<string>();

    // Direct token references
    if (entity.TokenMetadataUpdate?.id) {
      relatedTokenIds.add(String(entity.TokenMetadataUpdate.id));
    }
    if (entity.ObjectiveUpdate?.token_id) {
      relatedTokenIds.add(String(entity.ObjectiveUpdate.token_id));
    }
    if (entity.OwnersUpdate?.token_id) {
      relatedTokenIds.add(String(entity.OwnersUpdate.token_id));
    }
    if (entity.TokenPlayerNameUpdate?.id) {
      relatedTokenIds.add(String(entity.TokenPlayerNameUpdate.id));
    }
    if (entity.TokenContextUpdate?.id) {
      relatedTokenIds.add(String(entity.TokenContextUpdate.id));
    }
    if (entity.TokenScoreUpdate?.id) {
      relatedTokenIds.add(String(entity.TokenScoreUpdate.id));
    }

    // Relationship-based references (similar to SQL JOINs)
    if (entity.ObjectiveCreated?.objective_id) {
      const relatedTokenId = objectiveToTokens.get(String(entity.ObjectiveCreated.objective_id));
      if (relatedTokenId) {
        relatedTokenIds.add(relatedTokenId);
      }
    }

    if (entity.SettingsCreated?.settings_id) {
      const relatedTokenId = settingsToTokens.get(String(entity.SettingsCreated.settings_id));
      if (relatedTokenId) {
        relatedTokenIds.add(relatedTokenId);
      }
    }

    if (entity.GameRegistryUpdate?.id) {
      const relatedTokenIds2 = gameToTokens.get(String(entity.GameRegistryUpdate.id)) || [];
      relatedTokenIds2.forEach((id) => relatedTokenIds.add(id));
    }

    // Add entity to all related token groups
    relatedTokenIds.forEach((tokenId) => {
      if (!groupedByToken.has(tokenId)) {
        groupedByToken.set(tokenId, []);
      }
      groupedByToken.get(tokenId)!.push(entity);
    });
  });

  console.log('Token groups created:', groupedByToken.size);
  console.log('Token group keys:', Array.from(groupedByToken.keys()));

  // Merge entities for each token (similar to SQL aggregation)
  const gameTokens = Array.from(groupedByToken.entries()).map(([tokenId, tokenEntities]) => {
    // Initialize with all fields explicitly set
    const merged: GameTokenData = {
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

    tokenEntities.forEach((entity) => {
      // Merge TokenMetadataUpdate (main game data)
      if (entity.TokenMetadataUpdate) {
        merged.game_id = Number(entity.TokenMetadataUpdate.game_id);
        merged.game_over = entity.TokenMetadataUpdate.game_over;
        merged.lifecycle = {
          start: Number(entity.TokenMetadataUpdate.lifecycle_start || entity.TokenMetadataUpdate['lifecycle.start']) || undefined,
          end: Number(entity.TokenMetadataUpdate.lifecycle_end || entity.TokenMetadataUpdate['lifecycle.end']) || undefined,
        };
        merged.minted_at = Number(entity.TokenMetadataUpdate.minted_at) || undefined;
        merged.minted_by = Number(entity.TokenMetadataUpdate.minted_by) || undefined;
        merged.settings_id = entity.TokenMetadataUpdate.settings_id !== undefined ? Number(entity.TokenMetadataUpdate.settings_id) : undefined;
        merged.soulbound = entity.TokenMetadataUpdate.soulbound;
        merged.completed_all_objectives = entity.TokenMetadataUpdate.completed_all_objectives;
        // TokenMetadataUpdate doesn't have a metadata field in Cairo events
      }

      // Merge OwnersUpdate data
      if (entity.OwnersUpdate) {
        merged.owner = entity.OwnersUpdate.owner;
        merged.token_id = Number(entity.OwnersUpdate.token_id) || merged.token_id;
      }

      // Merge TokenPlayerNameUpdate (similar to LEFT JOIN) - with feltToString formatting
      if (entity.TokenPlayerNameUpdate) {
        const playerName = entity.TokenPlayerNameUpdate.player_name;
        merged.player_name = feltToString(playerName);
      }

      // Collect ObjectiveUpdate data (similar to GROUP_CONCAT) - SIMPLIFIED
      if (entity.ObjectiveUpdate) {
        const objectiveId = entity.ObjectiveUpdate.objective_id;
        if (objectiveId && !merged.objective_ids!.includes(String(objectiveId))) {
          merged.objective_ids!.push(String(objectiveId));
        }
      }

      // Merge TokenScoreUpdate (with COALESCE logic)
      if (entity.TokenScoreUpdate) {
        merged.score = Number(entity.TokenScoreUpdate.score) || 0;
        // Don't overwrite token_id - it's already set from the tokenId parameter
      }

      // Merge TokenContextUpdate with parsing
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

      // Merge SettingsCreated with parsing
      if (entity.SettingsCreated) {
        const rawSettings = entity.SettingsCreated.settings_data;
        const parsedSettings = parseSettingsData(rawSettings);
        merged.settings = {
          name: parsedSettings.name,
          description: parsedSettings.description,
          data: parsedSettings.data,
        };
        merged.settings_id = Number(entity.SettingsCreated.settings_id) || undefined;
      }

      // Auto-lookup SettingsCreated for TokenMetadataUpdate with settings_id
      if (entity.TokenMetadataUpdate?.settings_id && !merged.settings) {
        // Find SettingsCreated entity with matching settings_id
        const settingsEntity = tokenEntities.find(
          (e) =>
            String(e.SettingsCreated?.settings_id) === String(entity.TokenMetadataUpdate?.settings_id)
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

      // Merge TokenRendererUpdate
      if (entity.TokenRendererUpdate) {
        merged.renderer = entity.TokenRendererUpdate.renderer_address;
      }

      // Merge TokenClientUrlUpdate
      if (entity.TokenClientUrlUpdate) {
        merged.client_url = entity.TokenClientUrlUpdate.client_url;
      }

      // Merge MinterRegistryUpdate to populate minted_by_address
      if (entity.MinterRegistryUpdate && merged.minted_by) {
        if (Number(entity.MinterRegistryUpdate.id) === merged.minted_by) {
          merged.minted_by_address = entity.MinterRegistryUpdate.minter_address;
        }
      }
    });

    // Look up and include game metadata if we have a game_id
    if (merged.game_id && miniGamesLookup![merged.game_id]) {
      merged.gameMetadata = miniGamesLookup![merged.game_id];
    }

    // Remove duplicates from arrays (similar to DISTINCT in GROUP_CONCAT)
    merged.objective_ids = [...new Set(merged.objective_ids)];

    return merged;
  });

  return {
    gameTokens,
    objectivesLookup,
  };
}

// Filter function similar to SQL WHERE clause
export function filterGames(
  mergedGames: GameTokenData[],
  filters: {
    owner?: string;
    gameAddresses?: string[];
    tokenIds?: string[];
    hasContext?: boolean;
  }
): GameTokenData[] {
  return mergedGames.filter((game) => {
    if (filters.owner && game.owner !== filters.owner) {
      return false;
    }

    if (filters.gameAddresses && filters.gameAddresses.length > 0) {
      if (!filters.gameAddresses.includes(game.gameMetadata?.contract_address || '')) {
        return false;
      }
    }

    if (filters.tokenIds && filters.tokenIds.length > 0) {
      if (!filters.tokenIds.includes(game.token_id.toString())) {
        return false;
      }
    }

    if (filters.hasContext !== undefined) {
      const hasContext = !!game.context;
      if (hasContext !== filters.hasContext) {
        return false;
      }
    }

    return true;
  });
}

// Pagination function similar to SQL LIMIT/OFFSET
export function paginateGames(
  games: GameTokenData[],
  limit: number = 100,
  offset: number = 0
): GameTokenData[] {
  return games.slice(offset, offset + limit);
}

// Utility function to merge entities from multiple endpoints
export function mergeMultipleEndpoints(...entityArrays: EntityData[][]): EntityData[] {
  const merged: EntityData[] = [];

  // Flatten all arrays into a single array
  entityArrays.forEach((entities) => {
    if (entities && Array.isArray(entities)) {
      merged.push(...entities);
    }
  });

  return merged;
}

// Performance optimization utilities

// Memoization for expensive operations
const memoCache = new Map<string, any>();

export function memoizeTransform<T>(key: string, fn: () => T): T {
  if (memoCache.has(key)) {
    return memoCache.get(key);
  }
  const result = fn();
  memoCache.set(key, result);
  return result;
}

// Batch processing for large datasets
export function batchProcess<T, R>(
  items: T[],
  batchSize: number = 100,
  processor: (batch: T[]) => R[]
): R[] {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    results.push(...processor(batch));
  }
  return results;
}

// Optimized merge for large datasets
export function mergeGameEntitiesOptimized(entities: EntityData[]): GameTokenResult {
  // Use batch processing for large datasets
  if (entities.length > 1000) {
    // For large datasets, we need to combine results from batches
    const batches = [];
    for (let i = 0; i < entities.length; i += 100) {
      const batch = entities.slice(i, i + 100);
      batches.push(mergeGameEntities(batch));
    }

    // Combine all batch results
    const allGames: GameTokenData[] = [];
    const combinedLookup: Record<string, { data: string; game_id: any }> = {};

    batches.forEach((batch) => {
      allGames.push(...batch.gameTokens);
      Object.assign(combinedLookup, batch.objectivesLookup);
    });

    return {
      gameTokens: allGames,
      objectivesLookup: combinedLookup,
    };
  }

  return mergeGameEntities(entities);
}

// Backward compatibility function for existing code
export function mergeGameEntitiesCompat(entities: EntityData[]): GameTokenData[] {
  const result = mergeGameEntities(entities);
  return result.gameTokens;
}
