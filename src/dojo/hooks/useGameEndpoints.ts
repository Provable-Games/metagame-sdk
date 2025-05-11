import { useState, useEffect, useMemo } from 'react';
import { ByteArray, byteArray } from 'starknet';
import { getMetagameClient } from '../../singleton';

interface GameEndpoints {
  namespace: string;
  scoreModel: string;
  scoreAttribute: string;
  settingsModel: string;
}

const createEmptyGameEndpoints = (): GameEndpoints => ({
  namespace: '',
  scoreModel: '',
  scoreAttribute: '',
  settingsModel: '',
});

export const useGameEndpoints = (gameAddresses: string[]) => {
  const client = getMetagameClient();
  const provider = client.getConfig().provider;
  const [gameEndpoints, setGameEndpoints] = useState<Record<string, GameEndpoints> | null>(null);

  const getGameNamespace = async (gameAddress: string) => {
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
    setGameEndpoints((prev) => ({
      ...prev,
      [gameAddress]: {
        ...(prev?.[gameAddress] || createEmptyGameEndpoints()),
        namespace: byteArray.stringFromByteArray(gameNamespaceByteArray),
      },
    }));
  };

  const getGameScoreData = async (gameAddress: string) => {
    const gameScoreModelData = await provider.callContract({
      contractAddress: gameAddress,
      entrypoint: 'score_model',
      calldata: [],
    });
    const gameScoreModelByteArray: ByteArray = {
      data: gameScoreModelData.slice(0, -2),
      pending_word: gameScoreModelData[gameScoreModelData.length - 2],
      pending_word_len: gameScoreModelData[gameScoreModelData.length - 1],
    };
    const gameScoreAttributeData = await provider.callContract({
      contractAddress: gameAddress,
      entrypoint: 'score_attribute',
      calldata: [],
    });
    const gameScoreAttributeByteArray: ByteArray = {
      data: gameScoreAttributeData.slice(0, -2),
      pending_word: gameScoreAttributeData[gameScoreAttributeData.length - 2],
      pending_word_len: gameScoreAttributeData[gameScoreAttributeData.length - 1],
    };

    setGameEndpoints((prev) => ({
      ...prev,
      [gameAddress]: {
        ...(prev?.[gameAddress] || createEmptyGameEndpoints()),
        scoreModel: byteArray.stringFromByteArray(gameScoreModelByteArray),
        scoreAttribute: byteArray.stringFromByteArray(gameScoreAttributeByteArray),
      },
    }));
  };

  const getGameSettings = async (gameAddress: string) => {
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

    setGameEndpoints((prev) => ({
      ...prev,
      [gameAddress]: {
        ...(prev?.[gameAddress] || createEmptyGameEndpoints()),
        settingsModel: byteArray.stringFromByteArray(gameSettingsByteArray),
      },
    }));
  };

  const gameAddressesKey = useMemo(() => {
    return gameAddresses.map((address) => `'${address}'`).join(',');
  }, [gameAddresses]);

  useEffect(() => {
    if (gameAddresses.length > 0) {
      gameAddresses.forEach((gameAddress) => {
        getGameNamespace(gameAddress);
        getGameScoreData(gameAddress);
        getGameSettings(gameAddress);
      });
    }
  }, [provider, gameAddressesKey]);

  return gameEndpoints;
};
