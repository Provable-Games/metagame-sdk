import { useAccount, useConnect } from '@starknet-react/core';
import { useMiniGames, useOwnedGames, useGameScores } from 'metagame-sdk';
import './App.css';
import { indexAddress } from './lib';
// Separate component that uses the client from context
function App() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: miniGames } = useMiniGames({});
  console.log(miniGames);
  const { data: ownedGames } = useOwnedGames({
    address: indexAddress(address ?? '0x0'),
    gameAddresses: miniGames.map((game) => indexAddress(game?.contract_address ?? '')),
  });
  console.log(miniGames?.[0]?.contract_address);
  const { data: gameScores, error: gameScoresError } = useGameScores({
    gameAddress: indexAddress(miniGames?.[0]?.contract_address ?? ''),
    gameIds: ownedGames.map((game: any) => game.token_id),
  });
  console.log(ownedGames, address, miniGames, gameScores, gameScoresError);

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
        {miniGames.map((game) => (
          <div key={game.name}>{game.name}</div>
        ))}
      </div>
      <h3>Owned Games</h3>
      <div className="flex flex-row">
        {ownedGames.map((game: any) => (
          <div key={game.name}>{game.token_id}</div>
        ))}
      </div>
      {/* <h3>Game Scores</h3>
      <div className="flex flex-row">
        {gameScores.map((game: any) => (
          <div key={game.name}>{game.token_id}</div>
        ))}
      </div> */}
    </div>
  );
}

export default App;
