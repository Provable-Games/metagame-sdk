import { useAccount, useConnect } from '@starknet-react/core';
import { useMiniGames, useOwnedGames, useGameScores, useSubscribeGameScores } from 'metagame-sdk';
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
  useSubscribeGameScores({
    gameAddress: miniGames?.[0]?.contract_address ?? '0x0',
    gameIds: ownedGames.map((game: any) => game.token_id),
  });
  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <button
          onClick={() => {
            if (!address) {
              connect({ connector: connectors[0] });
            }
          }}
        >
          {address ? address : 'Connect'}
        </button>
      </div>
      <h3>Game Data</h3>
      <div className="flex flex-row">
        {miniGames.map((game, index: number) => (
          <div key={index}>{game.name}</div>
        ))}
      </div>
      <h3>Owned Games</h3>
      <div className="flex flex-row">
        {ownedGames.map((game: any, index: number) => (
          <div key={index}>{Number(game.token_id)}</div>
        ))}
      </div>
      <h3>Game Scores</h3>
      <div className="flex flex-row">
        {gameScores.map((game: any, index: number) => (
          <div key={index}>{`${Number(game.token_id)}: ${game.score} (${game.player_name})`}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
