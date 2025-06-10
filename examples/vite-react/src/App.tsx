import { useAccount, useConnect } from '@starknet-react/core';
import { useSubscribeGames } from 'metagame-sdk/subscriptions';
import { useSubscribeObjectives } from 'metagame-sdk/subscriptions';
import { useSubscribeSettings } from 'metagame-sdk/subscriptions';
import { useSubscribeMiniGames } from 'metagame-sdk/subscriptions';
import { displayAddress } from './lib/index';
import './App.css';

function App() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();

  const { games } = useSubscribeGames({});

  const { objectives } = useSubscribeObjectives({});
  const { settings } = useSubscribeSettings({});
  const { miniGames } = useSubscribeMiniGames({});

  console.log('Games:', games);
  console.log('Objectives:', objectives);
  console.log('Settings:', settings);
  console.log('Mini Games:', miniGames);

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
      <h1 className="text-2xl font-bold">Mini Games Available</h1>
      <div className="w-full overflow-y-auto mb-8">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Game ID
              </th>
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
                Developer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Genre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contract Address
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(miniGames).map(([gameId, game], index: number) => (
              <tr key={gameId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {game.game_id}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {game.name}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {game.description || 'No description available'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {game.developer}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {game.genre}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {displayAddress(game.contract_address)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h1 className="text-2xl font-bold">Games</h1>
      <div className="flex flex-row gap-5 overflow-x-auto p-4 mb-8">
        {games.map((game, index: number) => (
          <div
            className="flex flex-col w-[350px] flex-shrink-0 bg-white p-4 rounded-lg shadow-md border"
            key={index}
          >
            <span className="font-bold text-lg">#{Number(game.token_id)}</span>
            <span className="text-gray-600 text-sm">
              {game.minted_at && Number(game.minted_at) > 0
                ? `Minted: ${new Date(Number(game.minted_at) * 1000).toLocaleString()}`
                : 'Minted: Unknown'}
            </span>
            <span className="text-gray-600 text-sm">
              {game.lifecycle?.start && Number(game.lifecycle.start) > 0
                ? `Starts: ${new Date(Number(game.lifecycle.start) * 1000).toLocaleString()}`
                : 'Start time: Not set'}
            </span>
            <span className="text-gray-600 text-sm">
              {game.lifecycle?.end && Number(game.lifecycle.end) > 0
                ? `Ends: ${new Date(Number(game.lifecycle.end) * 1000).toLocaleString()}`
                : 'End time: Not set'}
            </span>
            <span className="mt-2 font-medium">Player: {game.player_name}</span>
            <span className="text-blue-600 font-bold text-xl mt-1">Score: {game.score}</span>
            <span className="text-sm text-gray-500 mt-1">
              Status: {game.game_over ? 'Finished' : 'In Progress'}
            </span>
            <span className="text-sm text-gray-500">Game ID: {game.game_id}</span>
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="w-full overflow-y-auto mb-8">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Settings ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Game Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Game Address
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Settings Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Settings Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Settings Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(settings).map(([key, setting]: [string, any], index: number) => (
              <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {setting.gameMetadata?.name || 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {setting.gameMetadata?.contract_address
                    ? displayAddress(setting.gameMetadata.contract_address)
                    : 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {setting.name || 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {setting.description || 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="max-w-xs truncate">
                    {typeof setting.data === 'object'
                      ? JSON.stringify(setting.data)
                      : setting.data?.toString() || 'N/A'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h1 className="text-2xl font-bold">Objectives</h1>
      <div className="w-full overflow-y-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Objective ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Game Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Game Address
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Objective Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(objectives).map(([key, objective]: [string, any], index: number) => (
              <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {objective.gameMetadata?.name || 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {objective.gameMetadata?.contract_address
                    ? displayAddress(objective.gameMetadata.contract_address)
                    : 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {objective.data}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
