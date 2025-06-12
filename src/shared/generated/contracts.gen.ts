import { DojoProvider, DojoCall } from "@dojoengine/core";
import {
  Account,
  AccountInterface,
  BigNumberish,
  CairoOption,
  ByteArray,
  CallData,
} from "starknet";

export function setupWorld(provider: DojoProvider) {
  const build_denshokan_approve_calldata = (
    to: string,
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "approve",
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
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_balanceOf_calldata = (account: string): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "balanceOf",
      calldata: [account],
    };
  };

  const denshokan_balanceOf = async (account: string) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_balanceOf_calldata(account)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_createObjective_calldata = (
    gameId: BigNumberish,
    objectiveId: BigNumberish,
    data: ByteArray
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "create_objective",
      calldata: [gameId, objectiveId, data],
    };
  };

  const denshokan_createObjective = async (
    snAccount: Account | AccountInterface,
    gameId: BigNumberish,
    objectiveId: BigNumberish,
    data: ByteArray
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_createObjective_calldata(gameId, objectiveId, data),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_createSettings_calldata = (
    gameId: BigNumberish,
    settingsId: BigNumberish,
    data: ByteArray
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "create_settings",
      calldata: [gameId, settingsId, data],
    };
  };

  const denshokan_createSettings = async (
    snAccount: Account | AccountInterface,
    gameId: BigNumberish,
    settingsId: BigNumberish,
    data: ByteArray
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_createSettings_calldata(gameId, settingsId, data),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_endGame_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "end_game",
      calldata: [tokenId],
    };
  };

  const denshokan_endGame = async (
    snAccount: Account | AccountInterface,
    tokenId: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_endGame_calldata(tokenId),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_getApproved_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "getApproved",
      calldata: [tokenId],
    };
  };

  const denshokan_getApproved = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_getApproved_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_getGameId_calldata = (
    gameAddress: string
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "get_game_id",
      calldata: [gameAddress],
    };
  };

  const denshokan_getGameId = async (gameAddress: string) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_getGameId_calldata(gameAddress)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_isApprovedForAll_calldata = (
    owner: string,
    operator: string
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "isApprovedForAll",
      calldata: [owner, operator],
    };
  };

  const denshokan_isApprovedForAll = async (
    owner: string,
    operator: string
  ) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_isApprovedForAll_calldata(owner, operator)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_isGamePlayable_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "is_game_playable",
      calldata: [tokenId],
    };
  };

  const denshokan_isGamePlayable = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_isGamePlayable_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_mint_calldata = (
    gameId: CairoOption<BigNumberish>,
    playerName: CairoOption<BigNumberish>,
    settingsId: CairoOption<BigNumberish>,
    start: CairoOption<BigNumberish>,
    end: CairoOption<BigNumberish>,
    objectiveIds: CairoOption<BigNumberish[]>,
    context: CairoOption<ByteArray>,
    client_url: CairoOption<ByteArray>,
    renderer_address: CairoOption<string>,
    to: string,
    soulbound: boolean
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "mint",
      calldata: [
        gameId,
        playerName,
        settingsId,
        start,
        end,
        objectiveIds,
        context,
        client_url,
        renderer_address,
        to,
        soulbound,
      ],
    };
  };

  const denshokan_mint = async (
    snAccount: Account | AccountInterface,
    gameId: CairoOption<BigNumberish>,
    playerName: CairoOption<BigNumberish>,
    settingsId: CairoOption<BigNumberish>,
    start: CairoOption<BigNumberish>,
    end: CairoOption<BigNumberish>,
    objectiveIds: CairoOption<BigNumberish[]>,
    context: CairoOption<ByteArray>,
    client_url: CairoOption<ByteArray>,
    renderer_address: CairoOption<string>,
    to: string,
    soulbound: boolean
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_mint_calldata(
          gameId,
          playerName,
          settingsId,
          start,
          end,
          objectiveIds,
          context,
          client_url,
          renderer_address,
          to,
          soulbound
        ),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_name_calldata = (): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "name",
      calldata: [],
    };
  };

  const denshokan_name = async () => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_name_calldata()
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_objectiveIds_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "objective_ids",
      calldata: [tokenId],
    };
  };

  const denshokan_objectiveIds = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_objectiveIds_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_ownerOf_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "ownerOf",
      calldata: [tokenId],
    };
  };

  const denshokan_ownerOf = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_ownerOf_calldata(tokenId)
      );
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
    color: CairoOption<ByteArray>
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "register_game",
      calldata: [
        creatorAddress,
        name,
        description,
        developer,
        publisher,
        genre,
        image,
        color,
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
    color: CairoOption<ByteArray>
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
          color
        ),
        "denshokan_0_0_1"
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
      contractName: "denshokan",
      entrypoint: "safeTransferFrom",
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
        "denshokan_0_0_1"
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
      contractName: "denshokan",
      entrypoint: "setApprovalForAll",
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
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_setTokenMetadata_calldata = (
    tokenId: BigNumberish,
    gameId: BigNumberish,
    playerName: CairoOption<BigNumberish>,
    settingsId: BigNumberish,
    start: CairoOption<BigNumberish>,
    end: CairoOption<BigNumberish>,
    objectiveIds: CairoOption<BigNumberish[]>,
    context: CairoOption<ByteArray>
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "set_token_metadata",
      calldata: [
        tokenId,
        gameId,
        playerName,
        settingsId,
        start,
        end,
        objectiveIds,
        context,
      ],
    };
  };

  const denshokan_setTokenMetadata = async (
    snAccount: Account | AccountInterface,
    tokenId: BigNumberish,
    gameId: BigNumberish,
    playerName: CairoOption<BigNumberish>,
    settingsId: BigNumberish,
    start: CairoOption<BigNumberish>,
    end: CairoOption<BigNumberish>,
    objectiveIds: CairoOption<BigNumberish[]>,
    context: CairoOption<ByteArray>
  ) => {
    console.log(
      CallData.compile([
        tokenId,
        gameId,
        playerName,
        settingsId,
        start,
        end,
        objectiveIds,
        context,
      ])
    );
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_setTokenMetadata_calldata(
          tokenId,
          gameId,
          playerName,
          settingsId,
          start,
          end,
          objectiveIds,
          context
        ),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_settingsId_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "settings_id",
      calldata: [tokenId],
    };
  };

  const denshokan_settingsId = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_settingsId_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_supportsInterface_calldata = (
    interfaceId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "supports_interface",
      calldata: [interfaceId],
    };
  };

  const denshokan_supportsInterface = async (interfaceId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_supportsInterface_calldata(interfaceId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_symbol_calldata = (): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "symbol",
      calldata: [],
    };
  };

  const denshokan_symbol = async () => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_symbol_calldata()
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_tokenUri_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "token_uri",
      calldata: [tokenId],
    };
  };

  const denshokan_tokenUri = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_denshokan_tokenUri_calldata(tokenId)
      );
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
      contractName: "denshokan",
      entrypoint: "transferFrom",
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
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_denshokan_updateGame_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "denshokan",
      entrypoint: "update_game",
      calldata: [tokenId],
    };
  };

  const denshokan_updateGame = async (
    snAccount: Account | AccountInterface,
    tokenId: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_denshokan_updateGame_calldata(tokenId),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_metagame_mock_context_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "metagame_mock",
      entrypoint: "context",
      calldata: [tokenId],
    };
  };

  const metagame_mock_context = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_metagame_mock_context_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_metagame_mock_contextUri_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "metagame_mock",
      entrypoint: "context_uri",
      calldata: [tokenId],
    };
  };

  const metagame_mock_contextUri = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_metagame_mock_contextUri_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_metagame_mock_hasContext_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "metagame_mock",
      entrypoint: "has_context",
      calldata: [tokenId],
    };
  };

  const metagame_mock_hasContext = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_metagame_mock_hasContext_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_metagame_mock_initializer_calldata = (
    namespace: ByteArray,
    denshokanAddress: string
  ): DojoCall => {
    return {
      contractName: "metagame_mock",
      entrypoint: "initializer",
      calldata: [namespace, denshokanAddress],
    };
  };

  const metagame_mock_initializer = async (
    snAccount: Account | AccountInterface,
    namespace: ByteArray,
    denshokanAddress: string
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_metagame_mock_initializer_calldata(namespace, denshokanAddress),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_metagame_mock_mintGame_calldata = (
    gameId: CairoOption<BigNumberish>,
    playerName: CairoOption<BigNumberish>,
    settingsId: CairoOption<BigNumberish>,
    start: CairoOption<BigNumberish>,
    end: CairoOption<BigNumberish>,
    objectiveIds: CairoOption<BigNumberish[]>,
    client_url: CairoOption<ByteArray>,
    renderer_address: CairoOption<string>,
    to: string,
    soulbound: boolean
  ): DojoCall => {
    return {
      contractName: "metagame_mock",
      entrypoint: "mint_game",
      calldata: [
        gameId,
        playerName,
        settingsId,
        start,
        end,
        objectiveIds,
        client_url,
        renderer_address,
        to,
        soulbound,
      ],
    };
  };

  const metagame_mock_mintGame = async (
    snAccount: Account | AccountInterface,
    gameId: CairoOption<BigNumberish>,
    playerName: CairoOption<BigNumberish>,
    settingsId: CairoOption<BigNumberish>,
    start: CairoOption<BigNumberish>,
    end: CairoOption<BigNumberish>,
    objectiveIds: CairoOption<BigNumberish[]>,
    client_url: CairoOption<ByteArray>,
    renderer_address: CairoOption<string>,
    to: string,
    soulbound: boolean
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_metagame_mock_mintGame_calldata(
          gameId,
          playerName,
          settingsId,
          start,
          end,
          objectiveIds,
          client_url,
          renderer_address,
          to,
          soulbound
        ),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_metagame_mock_supportsInterface_calldata = (
    interfaceId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "metagame_mock",
      entrypoint: "supports_interface",
      calldata: [interfaceId],
    };
  };

  const metagame_mock_supportsInterface = async (interfaceId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_metagame_mock_supportsInterface_calldata(interfaceId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_completedObjective_calldata = (
    tokenId: BigNumberish,
    objectiveId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "completed_objective",
      calldata: [tokenId, objectiveId],
    };
  };

  const minigame_mock_completedObjective = async (
    tokenId: BigNumberish,
    objectiveId: BigNumberish
  ) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_minigame_mock_completedObjective_calldata(tokenId, objectiveId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_createObjectiveScore_calldata = (
    score: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "create_objective_score",
      calldata: [score],
    };
  };

  const minigame_mock_createObjectiveScore = async (
    snAccount: Account | AccountInterface,
    score: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_minigame_mock_createObjectiveScore_calldata(score),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_createSettingsDifficulty_calldata = (
    name: ByteArray,
    description: ByteArray,
    difficulty: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "create_settings_difficulty",
      calldata: [name, description, difficulty],
    };
  };

  const minigame_mock_createSettingsDifficulty = async (
    snAccount: Account | AccountInterface,
    name: ByteArray,
    description: ByteArray,
    difficulty: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_minigame_mock_createSettingsDifficulty_calldata(
          name,
          description,
          difficulty
        ),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_endGame_calldata = (
    tokenId: BigNumberish,
    score: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "end_game",
      calldata: [tokenId, score],
    };
  };

  const minigame_mock_endGame = async (
    snAccount: Account | AccountInterface,
    tokenId: BigNumberish,
    score: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_minigame_mock_endGame_calldata(tokenId, score),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_initializer_calldata = (
    gameCreator: string,
    gameName: BigNumberish,
    gameDescription: ByteArray,
    gameDeveloper: BigNumberish,
    gamePublisher: BigNumberish,
    gameGenre: BigNumberish,
    gameImage: ByteArray,
    gameColor: CairoOption<ByteArray>,
    gameNamespace: ByteArray,
    denshokanAddress: string
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "initializer",
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
        denshokanAddress,
      ],
    };
  };

  const minigame_mock_initializer = async (
    snAccount: Account | AccountInterface,
    gameCreator: string,
    gameName: BigNumberish,
    gameDescription: ByteArray,
    gameDeveloper: BigNumberish,
    gamePublisher: BigNumberish,
    gameGenre: BigNumberish,
    gameImage: ByteArray,
    gameColor: CairoOption<ByteArray>,
    gameNamespace: ByteArray,
    denshokanAddress: string
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_minigame_mock_initializer_calldata(
          gameCreator,
          gameName,
          gameDescription,
          gameDeveloper,
          gamePublisher,
          gameGenre,
          gameImage,
          gameColor,
          gameNamespace,
          denshokanAddress
        ),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_mint_calldata = (
    playerName: CairoOption<BigNumberish>,
    settingsId: CairoOption<BigNumberish>,
    start: CairoOption<BigNumberish>,
    end: CairoOption<BigNumberish>,
    objectiveIds: CairoOption<BigNumberish[]>,
    client_url: CairoOption<ByteArray>,
    renderer_address: CairoOption<string>,
    to: string,
    soulbound: boolean
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "mint",
      calldata: [
        playerName,
        settingsId,
        start,
        end,
        objectiveIds,
        client_url,
        renderer_address,
        to,
        soulbound,
      ],
    };
  };

  const minigame_mock_mint = async (
    snAccount: Account | AccountInterface,
    playerName: CairoOption<BigNumberish>,
    settingsId: CairoOption<BigNumberish>,
    start: CairoOption<BigNumberish>,
    end: CairoOption<BigNumberish>,
    objectiveIds: CairoOption<BigNumberish[]>,
    client_url: CairoOption<ByteArray>,
    renderer_address: CairoOption<string>,
    to: string,
    soulbound: boolean
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_minigame_mock_mint_calldata(
          playerName,
          settingsId,
          start,
          end,
          objectiveIds,
          client_url,
          renderer_address,
          to,
          soulbound
        ),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_objectiveExists_calldata = (
    objectiveId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "objective_exists",
      calldata: [objectiveId],
    };
  };

  const minigame_mock_objectiveExists = async (objectiveId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_minigame_mock_objectiveExists_calldata(objectiveId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_objectives_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "objectives",
      calldata: [tokenId],
    };
  };

  const minigame_mock_objectives = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_minigame_mock_objectives_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_objectivesUri_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "objectives_uri",
      calldata: [tokenId],
    };
  };

  const minigame_mock_objectivesUri = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_minigame_mock_objectivesUri_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_score_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "score",
      calldata: [tokenId],
    };
  };

  const minigame_mock_score = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_minigame_mock_score_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_settingExists_calldata = (
    settingsId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "setting_exists",
      calldata: [settingsId],
    };
  };

  const minigame_mock_settingExists = async (settingsId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_minigame_mock_settingExists_calldata(settingsId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_settings_calldata = (
    settingsId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "settings",
      calldata: [settingsId],
    };
  };

  const minigame_mock_settings = async (settingsId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_minigame_mock_settings_calldata(settingsId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_settingsUri_calldata = (
    settingsId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "settings_uri",
      calldata: [settingsId],
    };
  };

  const minigame_mock_settingsUri = async (settingsId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_minigame_mock_settingsUri_calldata(settingsId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_startGame_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "start_game",
      calldata: [tokenId],
    };
  };

  const minigame_mock_startGame = async (
    snAccount: Account | AccountInterface,
    tokenId: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_minigame_mock_startGame_calldata(tokenId),
        "denshokan_0_0_1"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_supportsInterface_calldata = (
    interfaceId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "supports_interface",
      calldata: [interfaceId],
    };
  };

  const minigame_mock_supportsInterface = async (interfaceId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_minigame_mock_supportsInterface_calldata(interfaceId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_minigame_mock_tokenUri_calldata = (
    tokenId: BigNumberish
  ): DojoCall => {
    return {
      contractName: "minigame_mock",
      entrypoint: "token_uri",
      calldata: [tokenId],
    };
  };

  const minigame_mock_tokenUri = async (tokenId: BigNumberish) => {
    try {
      return await provider.call(
        "denshokan_0_0_1",
        build_minigame_mock_tokenUri_calldata(tokenId)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    denshokan: {
      approve: denshokan_approve,
      buildApproveCalldata: build_denshokan_approve_calldata,
      balanceOf: denshokan_balanceOf,
      buildBalanceOfCalldata: build_denshokan_balanceOf_calldata,
      createObjective: denshokan_createObjective,
      buildCreateObjectiveCalldata: build_denshokan_createObjective_calldata,
      createSettings: denshokan_createSettings,
      buildCreateSettingsCalldata: build_denshokan_createSettings_calldata,
      endGame: denshokan_endGame,
      buildEndGameCalldata: build_denshokan_endGame_calldata,
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
      objectiveIds: denshokan_objectiveIds,
      buildObjectiveIdsCalldata: build_denshokan_objectiveIds_calldata,
      ownerOf: denshokan_ownerOf,
      buildOwnerOfCalldata: build_denshokan_ownerOf_calldata,
      registerGame: denshokan_registerGame,
      buildRegisterGameCalldata: build_denshokan_registerGame_calldata,
      safeTransferFrom: denshokan_safeTransferFrom,
      buildSafeTransferFromCalldata: build_denshokan_safeTransferFrom_calldata,
      setApprovalForAll: denshokan_setApprovalForAll,
      buildSetApprovalForAllCalldata:
        build_denshokan_setApprovalForAll_calldata,
      setTokenMetadata: denshokan_setTokenMetadata,
      buildSetTokenMetadataCalldata: build_denshokan_setTokenMetadata_calldata,
      settingsId: denshokan_settingsId,
      buildSettingsIdCalldata: build_denshokan_settingsId_calldata,
      supportsInterface: denshokan_supportsInterface,
      buildSupportsInterfaceCalldata:
        build_denshokan_supportsInterface_calldata,
      symbol: denshokan_symbol,
      buildSymbolCalldata: build_denshokan_symbol_calldata,
      tokenUri: denshokan_tokenUri,
      buildTokenUriCalldata: build_denshokan_tokenUri_calldata,
      transferFrom: denshokan_transferFrom,
      buildTransferFromCalldata: build_denshokan_transferFrom_calldata,
      updateGame: denshokan_updateGame,
      buildUpdateGameCalldata: build_denshokan_updateGame_calldata,
    },
    metagame_mock: {
      context: metagame_mock_context,
      buildContextCalldata: build_metagame_mock_context_calldata,
      contextUri: metagame_mock_contextUri,
      buildContextUriCalldata: build_metagame_mock_contextUri_calldata,
      hasContext: metagame_mock_hasContext,
      buildHasContextCalldata: build_metagame_mock_hasContext_calldata,
      initializer: metagame_mock_initializer,
      buildInitializerCalldata: build_metagame_mock_initializer_calldata,
      mintGame: metagame_mock_mintGame,
      buildMintGameCalldata: build_metagame_mock_mintGame_calldata,
      supportsInterface: metagame_mock_supportsInterface,
      buildSupportsInterfaceCalldata:
        build_metagame_mock_supportsInterface_calldata,
    },
    minigame_mock: {
      completedObjective: minigame_mock_completedObjective,
      buildCompletedObjectiveCalldata:
        build_minigame_mock_completedObjective_calldata,
      createObjectiveScore: minigame_mock_createObjectiveScore,
      buildCreateObjectiveScoreCalldata:
        build_minigame_mock_createObjectiveScore_calldata,
      createSettingsDifficulty: minigame_mock_createSettingsDifficulty,
      buildCreateSettingsDifficultyCalldata:
        build_minigame_mock_createSettingsDifficulty_calldata,
      endGame: minigame_mock_endGame,
      buildEndGameCalldata: build_minigame_mock_endGame_calldata,
      initializer: minigame_mock_initializer,
      buildInitializerCalldata: build_minigame_mock_initializer_calldata,
      mint: minigame_mock_mint,
      buildMintCalldata: build_minigame_mock_mint_calldata,
      objectiveExists: minigame_mock_objectiveExists,
      buildObjectiveExistsCalldata:
        build_minigame_mock_objectiveExists_calldata,
      objectives: minigame_mock_objectives,
      buildObjectivesCalldata: build_minigame_mock_objectives_calldata,
      objectivesUri: minigame_mock_objectivesUri,
      buildObjectivesUriCalldata: build_minigame_mock_objectivesUri_calldata,
      score: minigame_mock_score,
      buildScoreCalldata: build_minigame_mock_score_calldata,
      settingExists: minigame_mock_settingExists,
      buildSettingExistsCalldata: build_minigame_mock_settingExists_calldata,
      settings: minigame_mock_settings,
      buildSettingsCalldata: build_minigame_mock_settings_calldata,
      settingsUri: minigame_mock_settingsUri,
      buildSettingsUriCalldata: build_minigame_mock_settingsUri_calldata,
      startGame: minigame_mock_startGame,
      buildStartGameCalldata: build_minigame_mock_startGame_calldata,
      supportsInterface: minigame_mock_supportsInterface,
      buildSupportsInterfaceCalldata:
        build_minigame_mock_supportsInterface_calldata,
      tokenUri: minigame_mock_tokenUri,
      buildTokenUriCalldata: build_minigame_mock_tokenUri_calldata,
    },
  };
}
