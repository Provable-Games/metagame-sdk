import React, { useState } from 'react';
import { useSubscribeGameTokens } from 'metagame-sdk/subscriptions';

const PaginatedGamesList: React.FC = () => {
  // Sorting state
  const [sortBy, setSortBy] = useState<
    'score' | 'minted_at' | 'player_name' | 'token_id' | 'game_over' | 'owner' | 'game_id'
  >('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    games, // Paginated games for current page
    allGames, // All filtered games (unpaginated)
    isSubscribing,
    error,
    isInitialized,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      hasNextPage,
      hasPreviousPage,
      goToPage,
      nextPage,
      previousPage,
      firstPage,
      lastPage,
    },
  } = useSubscribeGameTokens({
    // Optional filters
    soulbound: false,
    // hasContext: true,

    // Built-in pagination with sorting
    pagination: {
      pageSize: 5, // Show 5 games per page
      initialPage: 0, // Start on first page
      sortBy: sortBy, // Sort by selected field
      sortOrder: sortOrder, // Sort order
    },
  });

  // Show error if there is one
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-6">
        <div className="text-lg text-red-600 mb-4">Subscription Error</div>
        <div className="text-sm text-gray-600 bg-red-50 p-4 rounded-lg max-w-2xl">
          <strong>Error:</strong> {error.message}
        </div>
        <div className="text-xs text-gray-500 mt-2">Check the browser console for more details</div>
      </div>
    );
  }

  // Show loading state
  if (!isSubscribing || !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <div className="text-lg text-gray-600 mb-2">Connecting to real-time updates...</div>
        <div className="text-sm text-gray-500">
          Subscription: {isSubscribing ? '✅' : '⏳'} | Store: {isInitialized ? '✅' : '⏳'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Games with Built-in Pagination & Sorting
      </h1>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-gray-700">
          Showing {games.length} of {totalItems} games (Page {currentPage + 1} of {totalPages})
        </p>
        <p className="text-sm text-gray-700">Total games available: {allGames.length}</p>
        <p className="text-sm text-gray-700">
          Sorted by: <strong>{sortBy}</strong> ({sortOrder}ending)
        </p>
      </div>

      {/* Sorting controls */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="score">Score</option>
            <option value="minted_at">Minted Date</option>
            <option value="player_name">Player Name</option>
            <option value="token_id">Token ID</option>
            <option value="game_over">Game Status</option>
            <option value="owner">Owner</option>
            <option value="game_id">Game ID</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-order" className="text-sm font-medium text-gray-700">
            Order:
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Games list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {games.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No games found on this page.</p>
          </div>
        ) : (
          games.map((game) => (
            <div
              key={game.token_id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {game.player_name || 'Unnamed Player'}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Token ID:</strong> {game.token_id}
                </p>
                <p>
                  <strong>Score:</strong>{' '}
                  <span className="text-blue-600 font-bold text-lg">{game.score}</span>
                </p>
                <p>
                  <strong>Status:</strong> {game.game_over ? 'Finished' : 'In Progress'}
                </p>
                <p>
                  <strong>Owner:</strong> {game.owner}
                </p>
                {game.minted_at && Number(game.minted_at) > 0 && (
                  <p>
                    <strong>Minted:</strong>{' '}
                    {new Date(Number(game.minted_at) * 1000).toLocaleString()}
                  </p>
                )}
                {game.gameMetadata && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p>
                      <strong>Game:</strong> {game.gameMetadata.name}
                    </p>
                    <p>
                      <strong>Contract:</strong>{' '}
                      <span className="text-xs font-mono">
                        {game.gameMetadata.contract_address}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={firstPage}
              disabled={!hasPreviousPage}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Go to first page"
            >
              ⏮️ First
            </button>
            <button
              onClick={previousPage}
              disabled={!hasPreviousPage}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Go to previous page"
            >
              ⬅️ Previous
            </button>

            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>

            <button
              onClick={nextPage}
              disabled={!hasNextPage}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Go to next page"
            >
              Next ➡️
            </button>
            <button
              onClick={lastPage}
              disabled={!hasNextPage}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Go to last page"
            >
              Last ⏭️
            </button>
          </div>

          {/* Page selector dropdown */}
          <div className="flex justify-center items-center gap-2">
            <label htmlFor="page-select" className="text-sm text-gray-700">
              Jump to page:
            </label>
            <select
              id="page-select"
              value={currentPage}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i} value={i}>
                  Page {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Manual page input */}
          <div className="flex justify-center items-center gap-2">
            <label htmlFor="page-input" className="text-sm text-gray-700">
              Or enter page:
            </label>
            <input
              id="page-input"
              type="number"
              min="1"
              max={totalPages}
              placeholder={`1-${totalPages}`}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const pageNumber = parseInt((e.target as HTMLInputElement).value) - 1;
                  if (pageNumber >= 0 && pageNumber < totalPages) {
                    goToPage(pageNumber);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <small className="text-xs text-gray-500">Press Enter to go</small>
          </div>
        </div>
      )}

      {/* Real-time update indicator */}
      <div className="mt-8 bg-green-50 border border-green-200 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          ✅ <strong>Real-time updates enabled!</strong>
          New games will appear automatically and pagination will adjust dynamically.
        </p>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-medium text-green-700">
            How it works
          </summary>
          <ul className="mt-2 text-sm text-green-700 space-y-1 ml-4">
            <li>✨ New games minted → appear in real-time</li>
            <li>🔄 Game data changes → updates immediately</li>
            <li>🗑️ Games removed → pagination adjusts automatically</li>
            <li>📄 If current page becomes empty → auto-navigate to valid page</li>
            <li>📊 Total pages recalculated → controls update</li>
          </ul>
        </details>
      </div>
    </div>
  );
};

export default PaginatedGamesList;
