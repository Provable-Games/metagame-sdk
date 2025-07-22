import React from 'react';
import { useSubscribeGameTokens } from 'metagame-sdk/subscriptions';
import { useGameTokens } from 'metagame-sdk/sql';

const GameCards: React.FC = () => {
  const { games } = useSubscribeGameTokens({});
  const { data: gamesFromSQL } = useGameTokens({});

  console.log('games', games);
  console.log('gamesFromSQL', gamesFromSQL);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game, index: number) => (
          <div
            className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow"
            key={index}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xl text-gray-900">#{Number(game.token_id)}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    game.game_over ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'
                  }`}
                >
                  {game.game_over ? 'Finished' : 'In Progress'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  {game.minted_at && Number(game.minted_at) > 0
                    ? `Minted: ${new Date(Number(game.minted_at) * 1000).toLocaleString()}`
                    : 'Minted: Unknown'}
                </p>
                <p>
                  {game.lifecycle?.start && Number(game.lifecycle.start) > 0
                    ? `Starts: ${new Date(Number(game.lifecycle.start) * 1000).toLocaleString()}`
                    : 'Start time: Not set'}
                </p>
                <p>
                  {game.lifecycle?.end && Number(game.lifecycle.end) > 0
                    ? `Ends: ${new Date(Number(game.lifecycle.end) * 1000).toLocaleString()}`
                    : 'End time: Not set'}
                </p>
              </div>

              <div className="border-t pt-3">
                <p className="font-medium text-gray-900">Player: {game.player_name}</p>
                <p className="text-blue-600 font-bold text-2xl">Score: {game.score}</p>
                <p className="text-sm text-gray-500">Game ID: {game.game_id}</p>
              </div>

              {game.gameMetadata && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600">
                    <strong>Game:</strong> {game.gameMetadata.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {game.gameMetadata.contract_address}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        {games.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No games found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCards;
