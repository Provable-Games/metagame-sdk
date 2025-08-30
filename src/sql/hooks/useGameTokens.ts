import { gamesQuery } from '../queries/sql';
import { useSqlQuery, type SqlQueryResult } from '../services/sqlService';
import { feltToString } from '../../shared/lib';
import { useMemo } from 'react';
import { getMetagameClientSafe } from '../../shared/singleton';
import { parseSettingsData, parseContextData } from '../../shared/utils/dataTransformers';
import type { GameTokenData } from '../../shared/types';

interface GameTokensQueryParams {
  owner?: string;
  gameAddresses?: string[];
  tokenIds?: number[];
  hasContext?: boolean;
  mintedByAddress?: string;
  limit?: number;
  offset?: number;
}

export const useGameTokens = ({
  owner,
  gameAddresses,
  tokenIds,
  hasContext,
  mintedByAddress,
  limit = 100,
  offset = 0,
}: GameTokensQueryParams): SqlQueryResult<GameTokenData> => {
  const client = getMetagameClientSafe();
  const toriiUrl = client?.getConfig().toriiUrl || '';

  const query = useMemo(() => {
    if (!client) return null;
    return gamesQuery({
      namespace: client.getNamespace(),
      owner,
      gameAddresses,
      tokenIds,
      hasContext,
      mintedByAddress,
      limit,
      offset,
    });
  }, [client, owner, gameAddresses, tokenIds, hasContext, mintedByAddress, limit, offset]);

  const {
    data: rawGameData,
    loading,
    error: queryError,
    refetch,
  } = useSqlQuery(toriiUrl, query, true);

  const error = queryError;

  const gameScores = useMemo(() => {
    if (!rawGameData || !rawGameData.length) return [];

    return rawGameData.map((game: any) => {
      // Parse context data if available
      const parsedContext = game.context ? parseContextData(game.context) : undefined;

      // Parse settings data if available
      const parsedSettings = game.settings_data ? parseSettingsData(game.settings_data) : undefined;

      // Build gameMetadata object if GameMetadata fields are available
      const gameMetadata = game.game_metadata_id
        ? {
            game_id: Number(game.game_metadata_id) || 0,
            contract_address: game.game_metadata_contract_address || '',
            name: game.game_metadata_name || '',
            description: game.game_metadata_description || '',
            developer: game.game_metadata_developer || '',
            publisher: game.game_metadata_publisher || '',
            genre: game.game_metadata_genre || '',
            image: game.game_metadata_image || '',
            color: game.game_metadata_color,
            client_url: game.game_metadata_client_url,
            renderer_address: game.game_metadata_renderer_address,
          }
        : undefined;

      const filteredGame: GameTokenData = {
        game_id: Number(game.game_id),
        game_over: game.game_over,
        lifecycle: {
          start: Number(game.lifecycle_start) || undefined,
          end: Number(game.lifecycle_end) || undefined,
        },
        minted_at: Number(game.minted_at) || undefined,
        minted_by: Number(game.minted_by) || undefined,
        minted_by_address: game.minted_by_address,
        owner: game.owner,
        settings_id: game.settings_id == null ? undefined : Number(game.settings_id),
        soulbound: Boolean(game.soulbound),
        completed_all_objectives: Boolean(game.completed_all_objectives),
        token_id: Number(game.token_id) || 0,
        player_name: feltToString(game.player_name) || undefined,
        metadata: game.metadata,
        context: parsedContext
          ? {
              name: parsedContext.name,
              description: parsedContext.description,
              contexts: parsedContext.contexts,
            }
          : undefined,
        settings: parsedSettings
          ? {
              name: parsedSettings.name,
              description: parsedSettings.description,
              data: parsedSettings.data,
            }
          : undefined,
        score: Number(game.score) || 0,
        objective_ids: game.objective_ids
          ? game.objective_ids
              .split(',')
              .map((id: string) => id.toString())
              .filter((id: string) => id && id.trim() !== '' && id !== '0')
          : [],
        renderer: game.renderer,
        client_url: game.client_url,
        gameMetadata,
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
