import { useAccount, useConnect } from '@starknet-react/core';
import { useMiniGames, useOwnedGames, useGameScores } from 'metagame-sdk';
import { displayAddress } from '../src/lib/index';
import './App.css';

function App() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();

  const { data: miniGames } = useMiniGames({});

  const { data: ownedGames } = useOwnedGames({
    address: address ?? '0x0',
    gameAddresses: miniGames.map((game) => game?.contract_address ?? '0x0'),
  });

  const { data: gameScores } = useGameScores({
    gameAddress: miniGames?.[0]?.contract_address ?? '0x0',
    gameIds: ownedGames.map((game: any) => game.token_id),
  });

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
            {miniGames.map((game, index: number) => (
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
          {ownedGames.map((game: any, index: number) => (
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
          ))}
        </div>
      </div>
      <h1 className="text-2xl font-bold">Game Scores</h1>
      <div className="flex flex-row gap-5 overflow-x-auto p-4">
        {gameScores.map((game: any, index: number) => (
          <div
            className="flex flex-col w-[300px] flex-shrink-0 bg-white p-4 rounded-lg shadow-md"
            key={index}
          >
            <span className="font-bold text-lg">#{Number(game.token_id)}</span>
            <span className="text-gray-600 text-sm">
              {`Minted: ${new Date(Number(game.minted) * 1000).toLocaleString()}`}
            </span>
            <span className="text-gray-600 text-sm">
              {Number(game.started) > 0
                ? `Starts: ${new Date(Number(game.started) * 1000).toLocaleString()}`
                : 'Start time: Not set'}
            </span>
            <span className="text-gray-600 text-sm">
              {Number(game.ended) > 0
                ? `Ends: ${new Date(Number(game.ended) * 1000).toLocaleString()}`
                : 'End time: Not set'}
            </span>
            <span className="mt-2 font-medium">{game.player_name}</span>
            <span className="text-blue-600 font-bold text-xl mt-1">{game.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
