import {
  useSubscribeGamesStore,
  useMergedGames,
  useMergedGame,
  useMergedGamesMetadata,
} from '../hooks';

// Example 1: Basic real-time subscription with store
export function useRealTimeGames() {
  // Set up real-time subscriptions that update the store
  const { isSubscribed, error } = useSubscribeGamesStore({
    enabled: true,
    logging: true, // Enable logging to see real-time updates
    initializeWithExisting: true, // Load existing data first
  });

  // Get filtered games from store (these update automatically)
  const allGames = useMergedGames();
  const playerGames = useMergedGames({
    owner: '0x123...',
  });
  const gamesByContract = useMergedGames({
    gameAddresses: ['0xabc...', '0xdef...'],
  });

  return {
    allGames,
    playerGames,
    gamesByContract,
    isSubscribed,
    error,
  };
}

// Example 2: Watch a specific game in real-time
export function useWatchGame(tokenId: string) {
  // Subscribe to updates
  useSubscribeGamesStore({ enabled: true });

  // Get specific game (updates automatically)
  const game = useMergedGame(tokenId);

  return game;
}

// Example 3: Monitor store status
export function useStoreStatus() {
  const metadata = useMergedGamesMetadata();

  return {
    isReady: metadata.isInitialized,
    lastUpdate: new Date(metadata.lastUpdated),
    totalGames: metadata.totalGames,
    totalEntities: metadata.totalEntities,
  };
}

// Example 4: Real-time leaderboard
export function useLeaderboard() {
  useSubscribeGamesStore({ enabled: true });

  const games = useMergedGames();

  // Sort by score and return top games
  const leaderboard = games
    .filter((game) => (game.score || 0) > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 10);

  return leaderboard;
}

// Example 5: Player dashboard
export function usePlayerDashboard(playerAddress: string) {
  useSubscribeGamesStore({ enabled: true });

  const playerGames = useMergedGames({ owner: playerAddress });

  return {
    totalGames: playerGames.length,
    totalScore: playerGames.reduce((sum, game) => sum + Number(game.score || 0), 0),
    completedGames: playerGames.filter((game) => game.completed_all_objectives).length,
    inProgressGames: playerGames.filter((game) => !game.game_over && !game.completed_all_objectives)
      .length,
    recentGames: playerGames
      .sort((a, b) => Number(b.minted_at || 0) - Number(a.minted_at || 0))
      .slice(0, 5),
  };
}

/* 
Usage in components:

// 1. Real-time games list
function GamesList() {
  const { allGames, isSubscribed } = useRealTimeGames();
  
  if (!isSubscribed) return <div>Connecting...</div>;
  
  return (
    <div>
      {allGames.map(game => (
        <GameCard key={game.token_id} game={game} />
      ))}
    </div>
  );
}

// 2. Live game details
function GameDetails({ tokenId }: { tokenId: string }) {
  const game = useWatchGame(tokenId);
  
  if (!game) return <div>Game not found</div>;
  
  return (
    <div>
      <h1>Score: {game.score}</h1>
      <p>Owner: {game.owner}</p>
      <p>Objectives: {game.objective_ids?.length}/total</p>
    </div>
  );
}

// 3. Live leaderboard
function Leaderboard() {
  const leaderboard = useLeaderboard();
  
  return (
    <div>
      {leaderboard.map((game, index) => (
        <div key={game.token_id}>
          #{index + 1} - {game.player_name}: {game.score}
        </div>
      ))}
    </div>
  );
}
*/
