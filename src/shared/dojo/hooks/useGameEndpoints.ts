import { useState, useEffect, useMemo } from 'react';
import { ByteArray, byteArray } from 'starknet';
import { getMetagameClient } from '../../singleton';

interface GameEndpoints {
  namespace: string;
  scoreModel: string;
  scoreAttribute: string;
  settingsModel: string;
}

// Update the state type to allow for undefined values
type GameEndpointsState = Record<string, GameEndpoints | null>;

export const useGameEndpoints = (gameAddresses: string[]) => {
  const client = getMetagameClient();
  const provider = client.getConfig().provider;
  const [gameEndpoints, setGameEndpoints] = useState<GameEndpointsState | null>(null);

  const getGameNamespace = async (gameAddress: string) => {
    try {
      const gameNamespace = await provider.callContract({
        contractAddress: gameAddress,
        entrypoint: 'namespace',
        calldata: [],
      });
      const gameNamespaceByteArray: ByteArray = {
        data: gameNamespace.slice(0, -2),
        pending_word: gameNamespace[gameNamespace.length - 2],
        pending_word_len: gameNamespace[gameNamespace.length - 1],
      };
      return byteArray.stringFromByteArray(gameNamespaceByteArray);
    } catch (error) {
      console.error('Failed to get game namespace:', error);
      return null;
    }
  };

  const getGameScoreData = async (gameAddress: string) => {
    try {
      const [gameScoreModelData, gameScoreAttributeData] = await Promise.all([
        provider.callContract({
          contractAddress: gameAddress,
          entrypoint: 'score_model',
          calldata: [],
        }),
        provider.callContract({
          contractAddress: gameAddress,
          entrypoint: 'score_attribute',
          calldata: [],
        }),
      ]);

      const gameScoreModelByteArray: ByteArray = {
        data: gameScoreModelData.slice(0, -2),
        pending_word: gameScoreModelData[gameScoreModelData.length - 2],
        pending_word_len: gameScoreModelData[gameScoreModelData.length - 1],
      };
      const gameScoreAttributeByteArray: ByteArray = {
        data: gameScoreAttributeData.slice(0, -2),
        pending_word: gameScoreAttributeData[gameScoreAttributeData.length - 2],
        pending_word_len: gameScoreAttributeData[gameScoreAttributeData.length - 1],
      };

      return {
        scoreModel: byteArray.stringFromByteArray(gameScoreModelByteArray),
        scoreAttribute: byteArray.stringFromByteArray(gameScoreAttributeByteArray),
      };
    } catch (error) {
      console.error('Failed to get game score data:', error);
      return null;
    }
  };

  const getGameSettings = async (gameAddress: string) => {
    try {
      const gameSettingsData = await provider.callContract({
        contractAddress: gameAddress,
        entrypoint: 'settings_model',
        calldata: [],
      });
      const gameSettingsByteArray: ByteArray = {
        data: gameSettingsData.slice(0, -2),
        pending_word: gameSettingsData[gameSettingsData.length - 2],
        pending_word_len: gameSettingsData[gameSettingsData.length - 1],
      };
      return byteArray.stringFromByteArray(gameSettingsByteArray);
    } catch (error) {
      console.error('Failed to get game settings:', error);
      return null;
    }
  };

  const gameAddressesKey = useMemo(() => {
    return gameAddresses.map((address) => `'${address}'`).join(',');
  }, [gameAddresses]);

  useEffect(() => {
    if (!gameAddresses || gameAddresses.length === 0) {
      setGameEndpoints(null);
      return;
    }

    const fetchGameData = async (gameAddress: string) => {
      if (!gameAddress) return;

      // First get namespace
      const namespace = await getGameNamespace(gameAddress);
      if (!namespace) {
        setGameEndpoints((prev) => ({
          ...prev,
          [gameAddress]: null,
        }));
        return;
      }

      // Then get score data
      const scoreData = await getGameScoreData(gameAddress);
      if (!scoreData) {
        setGameEndpoints((prev) => ({
          ...prev,
          [gameAddress]: null,
        }));
        return;
      }

      // Finally get settings
      const settings = await getGameSettings(gameAddress);
      if (!settings) {
        setGameEndpoints((prev) => ({
          ...prev,
          [gameAddress]: null,
        }));
        return;
      }

      // If all calls succeed, set the complete data
      setGameEndpoints((prev) => ({
        ...prev,
        [gameAddress]: {
          namespace,
          ...scoreData,
          settingsModel: settings,
        },
      }));
    };

    gameAddresses.forEach((gameAddress) => {
      fetchGameData(gameAddress);
    });
  }, [provider, gameAddressesKey]);

  return gameEndpoints;
};
