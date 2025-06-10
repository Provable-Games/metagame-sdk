import { DojoProvider, DojoCall } from '@dojoengine/core';
import {
  Account,
  AccountInterface,
  BigNumberish,
  CairoOption,
  CairoCustomEnum,
  ByteArray,
} from 'starknet';
import * as models from './models.gen';

export function setupWorld(provider: DojoProvider) {
  const build_app_mock_gameTaskCompleted_calldata = (
    tokenId: BigNumberish,
    score: BigNumberish
  ): DojoCall => {
    return {
      contractName: 'app_mock',
      entrypoint: 'game_task_completed',
      calldata: [tokenId, score],
    };
  };

  const app_mock_gameTaskCompleted = async (
    snAccount: Account | AccountInterface,
    tokenId: BigNumberish,
    score: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_app_mock_gameTaskCompleted_calldata(tokenId, score),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_app_mock_initializer_calldata = (): DojoCall => {
    return {
      contractName: 'app_mock',
      entrypoint: 'initializer',
      calldata: [],
    };
  };

  const app_mock_initializer = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(
        snAccount,
        build_app_mock_initializer_calldata(),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_app_mock_supportsInterface_calldata = (interfaceId: BigNumberish): DojoCall => {
    return {
      contractName: 'app_mock',
      entrypoint: 'supports_interface',
      calldata: [interfaceId],
    };
  };

  const app_mock_supportsInterface = async (interfaceId: BigNumberish) => {
    try {
      return await provider.call(
        'denshokan_0_0_1',
        build_app_mock_supportsInterface_calldata(interfaceId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_game_mock_endGame_calldata = (
    tokenId: BigNumberish,
    score: BigNumberish
  ): DojoCall => {
    return {
      contractName: 'game_mock',
      entrypoint: 'end_game',
      calldata: [tokenId, score],
    };
  };

  const game_mock_endGame = async (
    snAccount: Account | AccountInterface,
    tokenId: BigNumberish,
    score: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_game_mock_endGame_calldata(tokenId, score),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_game_mock_initializer_calldata = (
    gameCreator: string,
    gameName: BigNumberish,
    gameDescription: ByteArray,
    gameDeveloper: BigNumberish,
    gamePublisher: BigNumberish,
    gameGenre: BigNumberish,
    gameImage: ByteArray,
    gameColor: ByteArray,
    gameNamespace: ByteArray,
    gameScoreModel: ByteArray,
    gameScoreAttribute: ByteArray,
    gameSettingsModel: ByteArray,
    denshokanAddress: string
  ): DojoCall => {
    return {
      contractName: 'game_mock',
      entrypoint: 'initializer',
      calldata: [
        gameCreator,
        gameName,
        gameDescription,
        gameDeveloper,
        gamePublisher,
        gameGenre,
        gameImage,
        gameColor,
        gameNamespace,
        gameScoreModel,
        gameScoreAttribute,
        gameSettingsModel,
        denshokanAddress,
      ],
    };
  };

  const game_mock_initializer = async (
    snAccount: Account | AccountInterface,
    gameCreator: string,
    gameName: BigNumberish,
    gameDescription: ByteArray,
    gameDeveloper: BigNumberish,
    gamePublisher: BigNumberish,
    gameGenre: BigNumberish,
    gameImage: ByteArray,
    gameColor: ByteArray,
    gameNamespace: ByteArray,
    gameScoreModel: ByteArray,
    gameScoreAttribute: ByteArray,
    gameSettingsModel: ByteArray,
    denshokanAddress: string
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_game_mock_initializer_calldata(
          gameCreator,
          gameName,
          gameDescription,
          gameDeveloper,
          gamePublisher,
          gameGenre,
          gameImage,
          gameColor,
          gameNamespace,
          gameScoreModel,
          gameScoreAttribute,
          gameSettingsModel,
          denshokanAddress
        ),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_game_mock_mint_calldata = (
    playerName: BigNumberish,
    settingsId: BigNumberish,
    start: BigNumberish,
    end: BigNumberish,
    to: string,
    soulbound: boolean
  ): DojoCall => {
    return {
      contractName: 'game_mock',
      entrypoint: 'mint',
      calldata: [playerName, settingsId, start, end, to, soulbound],
    };
  };

  const game_mock_mint = async (
    snAccount: Account | AccountInterface,
    playerName: BigNumberish,
    settingsId: BigNumberish,
    start: BigNumberish,
    end: BigNumberish,
    to: string,
    soulbound: boolean
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_game_mock_mint_calldata(playerName, settingsId, start, end, to, soulbound),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_game_mock_score_calldata = (tokenId: BigNumberish): DojoCall => {
    return {
      contractName: 'game_mock',
      entrypoint: 'score',
      calldata: [tokenId],
    };
  };

  const game_mock_score = async (tokenId: BigNumberish) => {
    try {
      return await provider.call('denshokan_0_0_1', build_game_mock_score_calldata(tokenId));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_game_mock_setSettings_calldata = (
    settingsId: BigNumberish,
    name: BigNumberish,
    description: ByteArray,
    exists: boolean
  ): DojoCall => {
    return {
      contractName: 'game_mock',
      entrypoint: 'set_settings',
      calldata: [settingsId, name, description, exists],
    };
  };

  const game_mock_setSettings = async (
    snAccount: Account | AccountInterface,
    settingsId: BigNumberish,
    name: BigNumberish,
    description: ByteArray,
    exists: boolean
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_game_mock_setSettings_calldata(settingsId, name, description, exists),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_game_mock_settingExists_calldata = (settingsId: BigNumberish): DojoCall => {
    return {
      contractName: 'game_mock',
      entrypoint: 'setting_exists',
      calldata: [settingsId],
    };
  };

  const game_mock_settingExists = async (settingsId: BigNumberish) => {
    try {
      return await provider.call(
        'denshokan_0_0_1',
        build_game_mock_settingExists_calldata(settingsId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_game_mock_startGame_calldata = (tokenId: BigNumberish): DojoCall => {
    return {
      contractName: 'game_mock',
      entrypoint: 'start_game',
      calldata: [tokenId],
    };
  };

  const game_mock_startGame = async (
    snAccount: Account | AccountInterface,
    tokenId: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_game_mock_startGame_calldata(tokenId),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_game_mock_supportsInterface_calldata = (interfaceId: BigNumberish): DojoCall => {
    return {
      contractName: 'game_mock',
      entrypoint: 'supports_interface',
      calldata: [interfaceId],
    };
  };

  const game_mock_supportsInterface = async (interfaceId: BigNumberish) => {
    try {
      return await provider.call(
        'denshokan_0_0_1',
        build_game_mock_supportsInterface_calldata(interfaceId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_approve_calldata = (to: string, tokenId: BigNumberish): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'approve',
      calldata: [to, tokenId],
    };
  };

  const denshokan_approve = async (
    snAccount: Account | AccountInterface,
    to: string,
    tokenId: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_approve_calldata(to, tokenId),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_balanceOf_calldata = (account: string): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'balanceOf',
      calldata: [account],
    };
  };

  const denshokan_balanceOf = async (account: string) => {
    try {
      return await provider.call('denshokan_0_0_1', build_denshokan_balanceOf_calldata(account));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_getApproved_calldata = (tokenId: BigNumberish): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'getApproved',
      calldata: [tokenId],
    };
  };

  const denshokan_getApproved = async (tokenId: BigNumberish) => {
    try {
      return await provider.call('denshokan_0_0_1', build_denshokan_getApproved_calldata(tokenId));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_getGameId_calldata = (gameAddress: string): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'get_game_id',
      calldata: [gameAddress],
    };
  };

  const denshokan_getGameId = async (gameAddress: string) => {
    try {
      return await provider.call(
        'denshokan_0_0_1',
        build_denshokan_getGameId_calldata(gameAddress)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_isApprovedForAll_calldata = (owner: string, operator: string): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'isApprovedForAll',
      calldata: [owner, operator],
    };
  };

  const denshokan_isApprovedForAll = async (owner: string, operator: string) => {
    try {
      return await provider.call(
        'denshokan_0_0_1',
        build_denshokan_isApprovedForAll_calldata(owner, operator)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_isGamePlayable_calldata = (tokenId: BigNumberish): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'is_game_playable',
      calldata: [tokenId],
    };
  };

  const denshokan_isGamePlayable = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        'denshokan_0_0_1',
        build_denshokan_isGamePlayable_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_mint_calldata = (
    gameId: BigNumberish,
    playerName: BigNumberish,
    settingsId: BigNumberish,
    start: BigNumberish,
    end: BigNumberish,
    to: string,
    soulbound: boolean
  ): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'mint',
      calldata: [gameId, playerName, settingsId, start, end, to, soulbound],
    };
  };

  const denshokan_mint = async (
    snAccount: Account | AccountInterface,
    gameId: BigNumberish,
    playerName: BigNumberish,
    settingsId: BigNumberish,
    start: BigNumberish,
    end: BigNumberish,
    to: string,
    soulbound: boolean
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_mint_calldata(gameId, playerName, settingsId, start, end, to, soulbound),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_name_calldata = (): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'name',
      calldata: [],
    };
  };

  const denshokan_name = async () => {
    try {
      return await provider.call('denshokan_0_0_1', build_denshokan_name_calldata());
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_ownerOf_calldata = (tokenId: BigNumberish): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'ownerOf',
      calldata: [tokenId],
    };
  };

  const denshokan_ownerOf = async (tokenId: BigNumberish) => {
    try {
      return await provider.call('denshokan_0_0_1', build_denshokan_ownerOf_calldata(tokenId));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_registerGame_calldata = (
    creatorAddress: string,
    name: BigNumberish,
    description: ByteArray,
    developer: BigNumberish,
    publisher: BigNumberish,
    genre: BigNumberish,
    image: ByteArray,
    color: ByteArray,
    namespace: ByteArray,
    scoreModel: ByteArray,
    scoreAttribute: ByteArray,
    settingsModel: ByteArray
  ): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'register_game',
      calldata: [
        creatorAddress,
        name,
        description,
        developer,
        publisher,
        genre,
        image,
        color,
        namespace,
        scoreModel,
        scoreAttribute,
        settingsModel,
      ],
    };
  };

  const denshokan_registerGame = async (
    snAccount: Account | AccountInterface,
    creatorAddress: string,
    name: BigNumberish,
    description: ByteArray,
    developer: BigNumberish,
    publisher: BigNumberish,
    genre: BigNumberish,
    image: ByteArray,
    color: ByteArray,
    namespace: ByteArray,
    scoreModel: ByteArray,
    scoreAttribute: ByteArray,
    settingsModel: ByteArray
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_registerGame_calldata(
          creatorAddress,
          name,
          description,
          developer,
          publisher,
          genre,
          image,
          color,
          namespace,
          scoreModel,
          scoreAttribute,
          settingsModel
        ),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_safeTransferFrom_calldata = (
    from: string,
    to: string,
    tokenId: BigNumberish,
    data: Array<BigNumberish>
  ): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'safeTransferFrom',
      calldata: [from, to, tokenId, data],
    };
  };

  const denshokan_safeTransferFrom = async (
    snAccount: Account | AccountInterface,
    from: string,
    to: string,
    tokenId: BigNumberish,
    data: Array<BigNumberish>
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_safeTransferFrom_calldata(from, to, tokenId, data),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_setApprovalForAll_calldata = (
    operator: string,
    approved: boolean
  ): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'setApprovalForAll',
      calldata: [operator, approved],
    };
  };

  const denshokan_setApprovalForAll = async (
    snAccount: Account | AccountInterface,
    operator: string,
    approved: boolean
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_setApprovalForAll_calldata(operator, approved),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_supportsInterface_calldata = (interfaceId: BigNumberish): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'supports_interface',
      calldata: [interfaceId],
    };
  };

  const denshokan_supportsInterface = async (interfaceId: BigNumberish) => {
    try {
      return await provider.call(
        'denshokan_0_0_1',
        build_denshokan_supportsInterface_calldata(interfaceId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_symbol_calldata = (): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'symbol',
      calldata: [],
    };
  };

  const denshokan_symbol = async () => {
    try {
      return await provider.call('denshokan_0_0_1', build_denshokan_symbol_calldata());
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_tokenMetadata_calldata = (tokenId: BigNumberish): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'token_metadata',
      calldata: [tokenId],
    };
  };

  const denshokan_tokenMetadata = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        'denshokan_0_0_1',
        build_denshokan_tokenMetadata_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_tokenUri_calldata = (tokenId: BigNumberish): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'token_uri',
      calldata: [tokenId],
    };
  };

  const denshokan_tokenUri = async (tokenId: BigNumberish) => {
    try {
      return await provider.call('denshokan_0_0_1', build_denshokan_tokenUri_calldata(tokenId));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_transferFrom_calldata = (
    from: string,
    to: string,
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'transferFrom',
      calldata: [from, to, tokenId],
    };
  };

  const denshokan_transferFrom = async (
    snAccount: Account | AccountInterface,
    from: string,
    to: string,
    tokenId: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_transferFrom_calldata(from, to, tokenId),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_updateGame_calldata = (
    tokenId: BigNumberish,
    score: BigNumberish,
    gameOver: boolean
  ): DojoCall => {
    return {
      contractName: 'denshokan',
      entrypoint: 'update_game',
      calldata: [tokenId, score, gameOver],
    };
  };

  const denshokan_updateGame = async (
    snAccount: Account | AccountInterface,
    tokenId: BigNumberish,
    score: BigNumberish,
    gameOver: boolean
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_updateGame_calldata(tokenId, score, gameOver),
        'denshokan_0_0_1'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    app_mock: {
      gameTaskCompleted: app_mock_gameTaskCompleted,
      buildGameTaskCompletedCalldata: build_app_mock_gameTaskCompleted_calldata,
      initializer: app_mock_initializer,
      buildInitializerCalldata: build_app_mock_initializer_calldata,
      supportsInterface: app_mock_supportsInterface,
      buildSupportsInterfaceCalldata: build_app_mock_supportsInterface_calldata,
    },
    game_mock: {
      endGame: game_mock_endGame,
      buildEndGameCalldata: build_game_mock_endGame_calldata,
      initializer: game_mock_initializer,
      buildInitializerCalldata: build_game_mock_initializer_calldata,
      mint: game_mock_mint,
      buildMintCalldata: build_game_mock_mint_calldata,
      score: game_mock_score,
      buildScoreCalldata: build_game_mock_score_calldata,
      setSettings: game_mock_setSettings,
      buildSetSettingsCalldata: build_game_mock_setSettings_calldata,
      settingExists: game_mock_settingExists,
      buildSettingExistsCalldata: build_game_mock_settingExists_calldata,
      startGame: game_mock_startGame,
      buildStartGameCalldata: build_game_mock_startGame_calldata,
      supportsInterface: game_mock_supportsInterface,
      buildSupportsInterfaceCalldata: build_game_mock_supportsInterface_calldata,
    },
    denshokan: {
      approve: denshokan_approve,
      buildApproveCalldata: build_denshokan_approve_calldata,
      balanceOf: denshokan_balanceOf,
      buildBalanceOfCalldata: build_denshokan_balanceOf_calldata,
      getApproved: denshokan_getApproved,
      buildGetApprovedCalldata: build_denshokan_getApproved_calldata,
      getGameId: denshokan_getGameId,
      buildGetGameIdCalldata: build_denshokan_getGameId_calldata,
      isApprovedForAll: denshokan_isApprovedForAll,
      buildIsApprovedForAllCalldata: build_denshokan_isApprovedForAll_calldata,
      isGamePlayable: denshokan_isGamePlayable,
      buildIsGamePlayableCalldata: build_denshokan_isGamePlayable_calldata,
      mint: denshokan_mint,
      buildMintCalldata: build_denshokan_mint_calldata,
      name: denshokan_name,
      buildNameCalldata: build_denshokan_name_calldata,
      ownerOf: denshokan_ownerOf,
      buildOwnerOfCalldata: build_denshokan_ownerOf_calldata,
      registerGame: denshokan_registerGame,
      buildRegisterGameCalldata: build_denshokan_registerGame_calldata,
      safeTransferFrom: denshokan_safeTransferFrom,
      buildSafeTransferFromCalldata: build_denshokan_safeTransferFrom_calldata,
      setApprovalForAll: denshokan_setApprovalForAll,
      buildSetApprovalForAllCalldata: build_denshokan_setApprovalForAll_calldata,
      supportsInterface: denshokan_supportsInterface,
      buildSupportsInterfaceCalldata: build_denshokan_supportsInterface_calldata,
      symbol: denshokan_symbol,
      buildSymbolCalldata: build_denshokan_symbol_calldata,
      tokenMetadata: denshokan_tokenMetadata,
      buildTokenMetadataCalldata: build_denshokan_tokenMetadata_calldata,
      tokenUri: denshokan_tokenUri,
      buildTokenUriCalldata: build_denshokan_tokenUri_calldata,
      transferFrom: denshokan_transferFrom,
      buildTransferFromCalldata: build_denshokan_transferFrom_calldata,
      updateGame: denshokan_updateGame,
      buildUpdateGameCalldata: build_denshokan_updateGame_calldata,
    },
  };
}
