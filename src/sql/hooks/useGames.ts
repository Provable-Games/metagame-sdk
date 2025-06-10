import { gamesQuery } from '../queries/sql';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { feltToString } from '../../shared/lib';
import { useMemo } from 'react';
import { getMetagameClient } from '../../shared/singleton';

// Helper function to parse and normalize settings data
const parseSettingsData = (rawSettingsData: string): GameSettings | null => {
  if (!rawSettingsData) return null;

  try {
    const parsed = JSON.parse(rawSettingsData);

    // Handle the current structure: {Name, Description, Settings: {}}
    const name = parsed.Name || '';
    const description = parsed.Description || '';
    const config = parsed.Settings || {};

    return {
      name,
      description,
      config,
    };
  } catch (error) {
    console.warn('Failed to parse settings data:', error);
    return null;
  }
};

interface GamesQueryParams {
  namespace: string;
  owner?: string;
  gameAddresses?: string[];
  tokenIds?: string[];
  hasContext?: boolean;
  limit?: number;
  offset?: number;
}

interface GameSettings {
  name: string;
  description: string;
  config: Record<string, any>;
}

interface Game {
  contract_address: string;
  game_id: number;
  game_over: boolean;
  lifecycle_end: number;
  lifecycle_start: number;
  minted_at: number;
  minted_by: string;
  owner: string;
  settings_id: number;
  settings_data: GameSettings | null;
  soulbound: boolean;
  completed_all_objectives: boolean;
  token_id: number;
  player_name: string;
  metadata: string;
  score: number;
  objective_ids: number[];
  objectives_data: string[];
}

export const useGames = ({
  namespace,
  owner,
  gameAddresses,
  tokenIds,
  hasContext,
  limit = 100,
  offset = 0,
}: GamesQueryParams): SqlQueryResult<Game> => {
  const client = getMetagameClient();

  const query = gamesQuery({
    namespace,
    owner,
    gameAddresses,
    tokenIds,
    hasContext,
    limit,
    offset,
  });

  const {
    data: rawGameData,
    loading,
    error: queryError,
    refetch,
  } = useSqlQuery(client.getConfig().toriiUrl, query);

  const error = queryError;

  const gameScores = useMemo(() => {
    if (!rawGameData || !rawGameData.length) return [];

    return rawGameData.map((game: any) => {
      const filteredGame: Game = {
        contract_address: game.contract_address,
        game_id: Number(game.game_id),
        game_over: game.game_over,
        score: Number(game.score),
        player_name: feltToString(game.player_name),
        token_id: Number(game.token_id),
        metadata: game.metadata,
        lifecycle_end: Number(game['lifecycle.end']),
        lifecycle_start: Number(game['lifecycle.start']),
        minted_at: Number(game.minted_at),
        minted_by: game.minted_by,
        owner: game.owner,
        settings_id: Number(game.settings_id),
        settings_data: parseSettingsData(game.settings_data),
        soulbound: Boolean(game.soulbound),
        completed_all_objectives: Boolean(game.completed_all_objectives),
        objective_ids: game.objective_ids
          ? game.objective_ids
              .split(',')
              .map(Number)
              .filter((id: number) => !isNaN(id) && id !== 0)
          : [],
        objectives_data: game.objectives_data
          ? game.objectives_data.split(',').filter((data: string) => data && data.trim() !== '')
          : [],
      };
      return filteredGame;
    });
  }, [rawGameData]);

  return {
    data: gameScores,
    loading,
    error,
    refetch,
  };
};
