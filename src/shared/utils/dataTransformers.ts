import { feltToString } from '../lib';
import type { GameTokenData, GameMetadata, GameSettings, GameObjective } from '../types';

// Re-export from shared types for consistency
export type { GameTokenData, GameMetadata, GameSettings, GameObjective };

export interface EntityData {
  entityId: string;
  TokenMetadata?: any;
  TokenPlayerName?: any;
  TokenObjective?: any;
  TokenContextData?: any;
  ScoreUpdate?: any;
  GameRegistry?: any;
  SettingsData?: any;
  ObjectiveData?: any;
  Owners?: any;
  GameMetadata?: any;
  TokenRenderer?: any;
  TokenClientUrl?: any;
  MinterRegistryId?: any;
  [key: string]: any; // Allow for additional properties
}

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
    if (entity.TokenObjective && entity.TokenObjective.id === tokenId) {
      const objectiveId = entity.TokenObjective.objective_id;

      // Find the corresponding ObjectiveData
      const objectiveData = entities.find(
        (e) => e.ObjectiveData && e.ObjectiveData.objective_id === objectiveId
      );

      if (objectiveData?.ObjectiveData) {
        objectives.push({
          objective_id: objectiveId,
          data: objectiveData.ObjectiveData.data || '',
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
    (entity) => entity.SettingsData && entity.SettingsData.settings_id === settingsId
  );

  if (settingsEntity?.SettingsData) {
    const rawSettings = settingsEntity.SettingsData.data || settingsEntity.SettingsData;
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
    (entity) => entity.GameMetadata && entity.GameMetadata.id === gameId
  );

  if (gameEntity?.GameMetadata) {
    return {
      game_id: Number(gameEntity.GameMetadata.id) || 0,
      contract_address: gameEntity.GameMetadata.contract_address || '',
      creator_token_id: gameEntity.GameMetadata.creator_token_id || '',
      name: feltToString(gameEntity.GameMetadata.name) || '',
      description: gameEntity.GameMetadata.description || '',
      developer: feltToString(gameEntity.GameMetadata.developer) || '',
      publisher: feltToString(gameEntity.GameMetadata.publisher) || '',
      genre: feltToString(gameEntity.GameMetadata.genre) || '',
      image: gameEntity.GameMetadata.image || '',
      color: gameEntity.GameMetadata.color,
    };
  }

  return undefined;
};

// Helper function to get objectives data by objective ID
export const getObjectiveDataById = (objectiveId: string, entities: EntityData[]): string => {
  const objectiveEntity = entities.find(
    (entity) => entity.ObjectiveData && entity.ObjectiveData.objective_id === objectiveId
  );

  return objectiveEntity?.ObjectiveData?.data || '';
};

export const parseContextData = (
  rawContext: any
): { name: string; description: string; contexts: any } => {
  if (!rawContext) {
    return { name: '', description: '', contexts: {} };
  }

  try {
    // If it's already an object, use it directly
    if (typeof rawContext === 'object' && rawContext !== null) {
      return {
        name: rawContext.Name || rawContext.name || '',
        description: rawContext.Description || rawContext.description || '',
        contexts: rawContext.contexts || rawContext,
      };
    }

    // If it's a string, try to parse it as JSON
    if (typeof rawContext === 'string') {
      const parsed = JSON.parse(rawContext);
      return {
        name: parsed.Name || parsed.name || '',
        description: parsed.Description || parsed.description || '',
        contexts: parsed.contexts || parsed,
      };
    }

    // Fallback
    return { name: '', description: '', contexts: rawContext };
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
      (entity.TokenMetadata && entity.TokenMetadata.id === tokenId) ||
      (entity.Owners && entity.Owners.token_id === tokenId) ||
      (entity.TokenPlayerName && entity.TokenPlayerName.id === tokenId) ||
      (entity.TokenObjective && entity.TokenObjective.id === tokenId) ||
      (entity.TokenContextData && entity.TokenContextData.token_id === tokenId) ||
      (entity.ScoreUpdate && entity.ScoreUpdate.token_id === tokenId) ||
      (entity.TokenRenderer && entity.TokenRenderer.id === tokenId) ||
      (entity.TokenClientUrl && entity.TokenClientUrl.id === tokenId)
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

      // Get settings data if settings_id exists
      if (entity.TokenMetadata.settings_id) {
        merged.settings = getSettingsForToken(
          entity.TokenMetadata.settings_id.toString(),
          entities
        );
      }

      // Get game metadata if game_id exists
      if (entity.TokenMetadata.game_id) {
        merged.gameMetadata = getGameMetadataForToken(
          entity.TokenMetadata.game_id.toString(),
          entities
        );
      }

      // Get minter address if minted_by exists
      if (entity.TokenMetadata.minted_by) {
        const minterEntity = entities.find(
          (e) =>
            e.MinterRegistryId?.id &&
            Number(e.MinterRegistryId.id) === Number(entity.TokenMetadata.minted_by)
        );
        if (minterEntity?.MinterRegistryId?.contract_address) {
          merged.minted_by_address = minterEntity.MinterRegistryId.contract_address;
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
      }
    }

    if (entity.ScoreUpdate) {
      merged.score = entity.ScoreUpdate.score || entity.ScoreUpdate.value || 0;
    }

    if (entity.TokenContextData) {
      const rawContext = entity.TokenContextData.data || entity.TokenContextData.context;
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

    if (entity.TokenRenderer) {
      merged.renderer = entity.TokenRenderer.renderer_address;
    }

    if (entity.TokenClientUrl) {
      merged.client_url = entity.TokenClientUrl.client_url;
    }

    // Merge MinterRegistryId to populate minted_by_address
    if (entity.MinterRegistryId && merged.minted_by) {
      if (Number(entity.MinterRegistryId.id) === merged.minted_by) {
        merged.minted_by_address = entity.MinterRegistryId.contract_address;
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
    if (entity.TokenMetadata?.id) tokenIds.add(entity.TokenMetadata.id.toString());
    if (entity.Owners?.token_id) tokenIds.add(entity.Owners.token_id.toString());
    if (entity.TokenPlayerName?.id) tokenIds.add(entity.TokenPlayerName.id.toString());
    if (entity.TokenObjective?.id) tokenIds.add(entity.TokenObjective.id.toString());
    if (entity.TokenContextData?.token_id)
      tokenIds.add(entity.TokenContextData.token_id.toString());
    if (entity.ScoreUpdate?.token_id) tokenIds.add(entity.ScoreUpdate.token_id.toString());
    if (entity.TokenRenderer?.id) tokenIds.add(entity.TokenRenderer.id.toString());
    if (entity.TokenClientUrl?.id) tokenIds.add(entity.TokenClientUrl.id.toString());
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
    if (entity.ObjectiveData?.objective_id) {
      const objectiveId = entity.ObjectiveData.objective_id.toString();
      lookup[objectiveId] = {
        data: entity.ObjectiveData.data || entity.ObjectiveData,
        game_id: entity.ObjectiveData.game_id,
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
    if (entity.GameMetadata?.id && entity.GameMetadata?.contract_address) {
      const gameId = entity.GameMetadata.id.toString();
      lookup[gameId] = {
        game_id: Number(entity.GameMetadata.id) || 0,
        contract_address: entity.GameMetadata.contract_address,
        creator_token_id: entity.GameMetadata.creator_token_id || '',
        name: feltToString(entity.GameMetadata.name) || '',
        description: entity.GameMetadata.description || '',
        developer: feltToString(entity.GameMetadata.developer) || '',
        publisher: feltToString(entity.GameMetadata.publisher) || '',
        genre: feltToString(entity.GameMetadata.genre) || '',
        image: entity.GameMetadata.image || '',
        color: entity.GameMetadata.color,
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
    if (entity.TokenObjective?.objective_id && entity.TokenObjective?.id) {
      objectiveToTokens.set(
        entity.TokenObjective.objective_id.toString(),
        entity.TokenObjective.id.toString()
      );
    }

    // Map settings_id to token_id (1:1 relationship)
    if (entity.TokenMetadata?.settings_id && entity.TokenMetadata?.id) {
      settingsToTokens.set(
        entity.TokenMetadata.settings_id.toString(),
        entity.TokenMetadata.id.toString()
      );
    }

    // Map game_id to multiple token_ids (1:many relationship)
    if (entity.TokenMetadata?.game_id && entity.TokenMetadata?.id) {
      const gameId = entity.TokenMetadata.game_id.toString();
      const tokenId = entity.TokenMetadata.id.toString();

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
    if (entity.TokenMetadata?.id) {
      relatedTokenIds.add(entity.TokenMetadata.id.toString());
    }
    if (entity.TokenObjective?.id) {
      relatedTokenIds.add(entity.TokenObjective.id.toString());
    }
    if (entity.Owners?.token_id) {
      relatedTokenIds.add(entity.Owners.token_id.toString());
    }
    if (entity.TokenPlayerName?.id) {
      relatedTokenIds.add(entity.TokenPlayerName.id.toString());
    }
    if (entity.TokenContextData?.token_id) {
      relatedTokenIds.add(entity.TokenContextData.token_id.toString());
    }
    if (entity.ScoreUpdate?.token_id) {
      relatedTokenIds.add(entity.ScoreUpdate.token_id.toString());
    }

    // Relationship-based references (similar to SQL JOINs)
    if (entity.ObjectiveData?.objective_id) {
      const relatedTokenId = objectiveToTokens.get(entity.ObjectiveData.objective_id.toString());
      if (relatedTokenId) {
        relatedTokenIds.add(relatedTokenId);
      }
    }

    if (entity.SettingsData?.settings_id) {
      const relatedTokenId = settingsToTokens.get(entity.SettingsData.settings_id.toString());
      if (relatedTokenId) {
        relatedTokenIds.add(relatedTokenId);
      }
    }

    if (entity.GameRegistry?.id) {
      const relatedTokenIds2 = gameToTokens.get(entity.GameRegistry.id.toString()) || [];
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
      // Merge TokenMetadata (main game data)
      if (entity.TokenMetadata) {
        merged.game_id = entity.TokenMetadata.game_id;
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
      }

      // Merge Owners data
      if (entity.Owners) {
        merged.owner = entity.Owners.owner || entity.Owners.owner_address;
        merged.token_id = entity.Owners.token_id?.toString() || merged.token_id;
      }

      // Merge TokenPlayerName (similar to LEFT JOIN) - with feltToString formatting
      if (entity.TokenPlayerName) {
        const playerName = entity.TokenPlayerName.player_name || entity.TokenPlayerName.name;
        merged.player_name = feltToString(playerName);
      }

      // Collect TokenObjective data (similar to GROUP_CONCAT) - SIMPLIFIED
      if (entity.TokenObjective) {
        const objectiveId = entity.TokenObjective.objective_id || entity.TokenObjective.id;
        if (objectiveId && !merged.objective_ids!.includes(objectiveId)) {
          merged.objective_ids!.push(objectiveId);
        }
      }

      // Merge ScoreUpdate (with COALESCE logic)
      if (entity.ScoreUpdate) {
        merged.score = entity.ScoreUpdate.score || entity.ScoreUpdate.value || 0;
        merged.token_id = entity.ScoreUpdate.token_id?.toString() || merged.token_id;
      }

      // Merge TokenContextData with parsing
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

      // Merge SettingsData with parsing
      if (entity.SettingsData) {
        const rawSettings = entity.SettingsData.data || entity.SettingsData;
        const parsedSettings = parseSettingsData(rawSettings);
        merged.settings = {
          name: parsedSettings.name,
          description: parsedSettings.description,
          data: parsedSettings.data,
        };
        merged.settings_id = Number(entity.SettingsData.settings_id) || undefined;
      }

      // Auto-lookup SettingsData for TokenMetadata with settings_id
      if (entity.TokenMetadata?.settings_id && !merged.settings) {
        // Find SettingsData entity with matching settings_id
        const settingsEntity = tokenEntities.find(
          (e) =>
            e.SettingsData?.settings_id?.toString() === entity.TokenMetadata.settings_id?.toString()
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

      // Merge TokenRenderer
      if (entity.TokenRenderer) {
        merged.renderer = entity.TokenRenderer.renderer_address;
      }

      // Merge TokenClientUrl
      if (entity.TokenClientUrl) {
        merged.client_url = entity.TokenClientUrl.client_url;
      }

      // Merge MinterRegistryId to populate minted_by_address
      if (entity.MinterRegistryId && merged.minted_by) {
        if (Number(entity.MinterRegistryId.id) === merged.minted_by) {
          merged.minted_by_address = entity.MinterRegistryId.contract_address;
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
