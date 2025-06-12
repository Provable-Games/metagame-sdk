import { useMemo } from 'react';
import { useAccount, useConnect } from '@starknet-react/core';
import {} from // useMiniGames,
// useOwnedGames,
// useOwnedGamesWithScores,
// useEternumQuests,
// useSubscribeGameScores,
// useSubscribeTokens,
// useSubscribeScores,
'metagame-sdk';
// import { useSettings, useMiniGames } from 'metagame-sdk/sql';
import { useDojoSDK } from '@dojoengine/sdk/react';

import { displayAddress } from './lib/index';
import './App.css';

function App() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();

  const queryAddress = useMemo(() => address, [address]);

  // const { data: miniGames } = useMiniGames({
  //   namespace: 's1_eternum', // Add required namespace
  // });
  const miniGames: any[] = []; // Placeholder

  const queryGameAddresses = useMemo(
    () => miniGames?.map((game) => game?.contract_address),
    [miniGames]
  );
  const queryGameAddress = useMemo(() => miniGames?.[0]?.contract_address, [miniGames]);

  // const { data: ownedGames } = useOwnedGames({
  //   address: queryAddress,
  //   gameAddresses: queryGameAddresses,
  // });

  // const { data: ownedGamesWithScores } = useOwnedGamesWithScores({
  //   address: queryAddress,
  //   gameAddress: queryGameAddress,
  //   metagame: {
  //     namespace: 's1_eternum',
  //     model: 'Quest',
  //     attribute: 'quest_tile_id',
  //     key: 'game_token_id',
  //   },
  // });

  // console.log(ownedGamesWithScores);

  // const { data: eternumQuests } = useEternumQuests({
  //   eternumNamespace: 's1_eternum',
  //   questTileIds: ownedGamesWithScores?.map((game) => game.metagame_data?.toString() ?? '') ?? [],
  // });

  // const { entities: gameScores } = useSubscribeGameScores({
  //   gameAddress: queryGameAddress,
  //   gameIds: ownedGamesWithScores?.map((game) => game.token_id.toString() ?? '') ?? [],
  // });

  // console.log(gameScores);

  // const { scores } = useSubscribeScores({
  //   gameAddress: queryGameAddress,
  //   // gameIds: ownedGamesWithScores?.map((game) => game.token_id.toString() ?? '') ?? [],
  // });

  // console.log(scores);

  // const { data: gameSettingsMetadata } = useSettings({
  //   gameAddresses: queryGameAddresses,
  // });
  const gameSettingsMetadata: any[] = []; // Placeholder

  console.log(gameSettingsMetadata);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-row justify-end h-20 w-full">
        <button
          className="h-14"
          onClick={() => {
            if (!address) {
              connect({ connector: connectors[0] });
            }
          }}
        >
          {address ? displayAddress(address) : 'Connect'}
        </button>
      </div>
      <h1 className="text-2xl font-bold">Game Data</h1>
      <div className="w-full overflow-y-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Address
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {miniGames?.map((game, index: number) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {game.name}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {game.description || 'No description available'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap">
                  {displayAddress(game.contract_address)}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-indigo-600 hover:text-indigo-900">Play</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h1 className="text-2xl font-bold">Owned Games</h1>
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex flex-row gap-4 min-w-min px-4">
          {/* {ownedGames.map((game: any, index: number) => (
            <div
              className="flex flex-col flex-shrink-0 w-[250px] bg-white rounded-lg shadow-md overflow-hidden"
              key={index}
            >
              <div className="p-3 bg-gray-50 border-b">
                <span className="font-bold text-lg">#{Number(game.token_id)}</span>
              </div>
              <div className="p-2">
                <img
                  src={JSON.parse(game.metadata)?.image}
                  alt={`Game #${Number(game.token_id)}`}
                  className="w-full h-auto rounded"
                  loading="lazy"
                />
              </div>
            </div>
          ))} */}
        </div>
      </div>
      <h1 className="text-2xl font-bold">Game Scores</h1>
      <div className="flex flex-row gap-5 overflow-x-auto p-4">
        {/* {ownedGamesWithScores.map((game: any, index: number) => {
          const quest = eternumQuests.find((quest) => quest.quest_tile_id === game.metagame_data);
          return (
            <div
              className="flex flex-col w-[300px] flex-shrink-0 bg-white p-4 rounded-lg shadow-md"
              key={index}
            >
              <span className="font-bold text-lg">#{Number(game.token_id)}</span>
              <span className="text-gray-600 text-sm">
                {`Minted: ${new Date(Number(game.minted) * 1000).toLocaleString()}`}
              </span>
              <span className="text-gray-600 text-sm">
                {Number(game.end) > 0
                  ? `Ends: ${new Date(Number(game.end) * 1000).toLocaleString()}`
                  : 'End time: Not set'}
              </span>
              <span className="mt-2 font-medium">{game.player_name}</span>
              <div className="flex flex-row items-center gap-2">
                <span className="text-gray-600 text-sm">Score</span>
                <span className="text-blue-600 font-bold text-xl mt-1">{game.score}</span>
              </div>
              <div className="flex flex-row items-center gap-2">
                <span className="text-gray-600 text-sm">Participants</span>
                <span className="text-blue-600 font-bold text-xl mt-1">
                  {quest?.participant_count}
                </span>
              </div>
            </div>
          );
        })} */}
      </div>
    </div>
  );
}

export default App;
