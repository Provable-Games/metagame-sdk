import { feltToString } from '../lib';

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
  [key: string]: any; // Allow for additional properties
}

export interface GameTokenData {
  contract_address: string | undefined;
  game_id: string | undefined;
  game_over: boolean | undefined;
  lifecycle: {
    start: string | undefined;
    end: string | undefined;
  };
  minted_at: string | undefined;
  minted_by: string | undefined;
  owner: string | undefined;
  settings_id: string | undefined;
  soulbound: boolean | undefined;
  completed_all_objectives: boolean | undefined;
  token_id: string;
  player_name: string | undefined;
  metadata: any | undefined;
  context: any | undefined;
  settings_data: any | undefined;
  score: number;
  objective_ids: string[];
  gameMetadata:
    | {
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
      }
    | undefined;
}

// New interface for objectives lookup
export interface ObjectivesLookup {
  [objective_id: string]: {
    data: string;
    game_id: number;
  };
}

// New interface for the complete result
export interface GameTokenResult {
  gameTokens: GameTokenData[];
  objectivesLookup: ObjectivesLookup;
}

// Build objectives lookup table from entities
export function buildObjectivesLookup(entities: EntityData[]): ObjectivesLookup {
  const lookup: ObjectivesLookup = {};

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
        game_id: gameId,
        contract_address: entity.GameMetadata.contract_address,
        creator_address: entity.GameMetadata.creator_address,
        name: entity.GameMetadata.name,
        description: entity.GameMetadata.description,
        developer: entity.GameMetadata.developer,
        publisher: entity.GameMetadata.publisher,
        genre: entity.GameMetadata.genre,
        image: entity.GameMetadata.image,
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
  objectivesLookup: ObjectivesLookup
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

    tokenEntities.forEach((entity) => {
      // Merge TokenMetadata (main game data)
      if (entity.TokenMetadata) {
        merged.game_id = entity.TokenMetadata.game_id;
        merged.game_over = entity.TokenMetadata.game_over;
        merged.lifecycle = {
          start: entity.TokenMetadata['lifecycle.start'],
          end: entity.TokenMetadata['lifecycle.end'],
        };
        merged.minted_at = entity.TokenMetadata.minted_at;
        merged.minted_by = entity.TokenMetadata.minted_by;
        merged.settings_id = entity.TokenMetadata.settings_id;
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

      // Merge TokenContextData
      if (entity.TokenContextData) {
        merged.context = entity.TokenContextData.data || entity.TokenContextData.context;
      }

      // Merge SettingsData
      if (entity.SettingsData) {
        merged.settings_data = entity.SettingsData.data || entity.SettingsData;
        merged.settings_id = entity.SettingsData.settings_id?.toString() || merged.settings_id;
      }

      // Auto-lookup SettingsData for TokenMetadata with settings_id
      if (entity.TokenMetadata?.settings_id && !merged.settings_data) {
        // Find SettingsData entity with matching settings_id
        const settingsEntity = tokenEntities.find(
          (e) =>
            e.SettingsData?.settings_id?.toString() === entity.TokenMetadata.settings_id?.toString()
        );
        if (settingsEntity?.SettingsData) {
          merged.settings_data = settingsEntity.SettingsData.data || settingsEntity.SettingsData;
        }
      }

      // Merge GameRegistry
      if (entity.GameRegistry) {
        merged.contract_address =
          entity.GameRegistry.contract_address || entity.GameRegistry.address;
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
      if (!filters.gameAddresses.includes(game.contract_address || '')) {
        return false;
      }
    }

    if (filters.tokenIds && filters.tokenIds.length > 0) {
      if (!filters.tokenIds.includes(game.token_id || '')) {
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
    const combinedLookup: ObjectivesLookup = {};

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
