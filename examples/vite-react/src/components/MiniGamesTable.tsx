import React from 'react';
import { useSubscribeMiniGames } from 'metagame-sdk/subscriptions';
import { useMiniGames } from 'metagame-sdk/sql';
import { displayAddress } from '../lib/index';

const MiniGamesTable: React.FC = () => {
  const { miniGames } = useSubscribeMiniGames({});
  const { minigames: miniGamesFromSQL } = useMiniGames({});

  console.log(miniGames);
  console.log(miniGamesFromSQL);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mini Games Available</h1>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200 border border-gray-200 rounded-lg">
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
        {Object.entries(miniGames).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No mini games found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniGamesTable;
