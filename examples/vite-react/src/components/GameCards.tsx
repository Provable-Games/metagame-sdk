import React from 'react';
import { useSubscribeGameTokens } from 'metagame-sdk/subscriptions';
import { useGameTokens } from 'metagame-sdk/sql';
import { useAccount } from '@starknet-react/core';
import { addAddressPadding } from 'starknet';
import { useGameTokenRanking, useGameLeaderboard } from 'metagame-sdk/sql';

const GameCards: React.FC = () => {
  const { address } = useAccount();
  const { games } = useSubscribeGameTokens({
    // context: {
    //   name: 'Budokan',
    //   attributes: {
    //     'Tournament ID': (1)?.toString() ?? '0',
    //   },
    // },
    // pagination: {
    //   pageSize: 10,
    //   sortBy: 'score',
    //   sortOrder: 'desc',
    // },
    // owner: addAddressPadding(address ?? '0'),
    // gameAddresses: [
    //   addAddressPadding('0x07ae26eecf0274aabb31677753ff3a4e15beec7268fa1b104f73ce3c89202831'),
    // ],
    // soulbound: false,
    // minted_by_address: addAddressPadding(
    //   '0x1db6fcda8eefcf806f29d888c8085644b8a9ea9ba74e28a6b4af4bd4ec256af'
    // ),
  });
  // const { data: gamesFromSQL } = useGameTokens({
  //   // mintedByAddress: '0x77b8ed8356a7c1f0903fc4ba6e15f9b09cf437ce04f21b2cbf32dc2790183d0',
  //   // tokenIds: [2],
  //   // owner: '0x77b8ed8356a7c1f0903fc4ba6e15f9b09cf437ce04f21b2cbf32dc2790183d0',
  //   sortBy: 'score',
  //   sortOrder: 'desc',
  //   pagination: {
  //     pageSize: 10,
  //   },
  // });

  const { ranking } = useGameTokenRanking({
    tokenId: 59,
    mintedByAddress: '0x02b481049177d5947b7ac5b40ae231c14af517c8cdc5506fb2529f064fc47edd',
  });

  console.log(ranking);

  const { leaderboard } = useGameLeaderboard({
    tokenId: 59,
    mintedByAddress: '0x02b481049177d5947b7ac5b40ae231c14af517c8cdc5506fb2529f064fc47edd',
  });

  console.log(leaderboard);

  // console.log('games', games);

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
