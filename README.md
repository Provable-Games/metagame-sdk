# Metagame SDK

A JavaScript/TypeScript SDK for interacting with Metagame components in Dojo.

## Package Structure

The SDK is now modularly organized with subpath exports for better separation of concerns:

### Core Package
```typescript
// Main import (includes everything for backward compatibility)
import { useSubscribeGames, useGames, MetagameProvider } from 'metagame-sdk';
```

### Modular Imports (Recommended)

```typescript
// Subscription hooks (Dojo real-time data)
import { 
  useSubscribeGames, 
  useSubscribeMiniGames, 
  useSubscribeSettings, 
  useSubscribeObjectives 
} from 'metagame-sdk/subscriptions';

// SQL hooks (Static queries)
import { 
  useGames, 
  useMiniGames, 
  useMetaGames, 
  useGameSettings 
} from 'metagame-sdk/sql';

// Shared utilities and types
import { 
  feltToString, 
  MetagameClient, 
  MetagameProvider 
} from 'metagame-sdk/shared';
```

**Benefits:**
- **Tree shaking**: Only import what you need
- **Clear separation**: Real-time vs static data
- **Better organization**: Easier to understand and maintain
- **Backward compatibility**: Existing imports still work

## Getting Started

1. Add `metagame-sdk` to your dependencies.

```shell
bun add metagame-sdk
```

2. Wrap your app with `MetagameProvider` and pass in your `toriiUrl` and starknet `provider`.

```tsx
export const MetagameProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [metagameClient, setMetagameClient] = useState<MetagameClient<any> | null>(null);
  const { provider } = useProvider();

  useEffect(() => {
    async function initialize() {
      const metagameClient = await initMetagame<SchemaType>({
        toriiUrl: dojoConfig.toriiUrl,
        provider: provider,
        worldAddress: '0x1234...',
        domain: {
          name: 'WORLD_NAME',
          version: '1.0',
          chainId: 'KATANA',
          revision: '1',
        }
      });

      setMetagameClient(metagameClient);
    }

    initialize();
  }, []);

  if (!metagameClient) {
    return <div>Loading...</div>;
  }

  return <MetagameProviderSDK metagameClient={metagameClient!}>{children}</MetagameProviderSDK>;
};
```

#### dojoSDK Configuration Options

The SDK now supports automatic dojoSDK creation with sensible defaults:

**Option 1: Automatic dojoSDK (Recommended)**
```tsx
const metagameClient = await initMetagame({
  toriiUrl: 'http://localhost:8080',
  provider: starknetProvider,
  worldAddress: '0x1234...',
  relayUrl: 'http://localhost:9090',
  domain: { name: 'WORLD_NAME', version: '1.0', chainId: 'KATANA', revision: '1' }
});
```

**Option 2: Provide your own dojoSDK**
```tsx
const customDojoSDK = await init<SchemaType>({
  client: {
    toriiUrl: 'http://localhost:8080',
    relayUrl: 'http://localhost:9090',
    worldAddress: '0x1234...',
  },
  domain: { name: 'CUSTOM_WORLD', version: '2.0', chainId: 'MAINNET', revision: '1' }
});

const metagameClient = await initMetagame({
  toriiUrl: 'http://localhost:8080',
  provider: starknetProvider,
  dojoSDK: customDojoSDK,
});
```

**Option 3: No dojoSDK (SQL queries only)**
```tsx
const metagameClient = await initMetagame({
  toriiUrl: 'http://localhost:8080',
  provider: starknetProvider,
});
```

3. Access the hooks from your components.

### Static Query (SQL-based)

```tsx
const { data: miniGames } = useMiniGames({});
```

Output:

```ts
[
  {
    contract_address: '0x020fc3c9efd0dde5f53642dac7f53638aeaae98ff9af5f1642546f389ce9dec5',
    creator_address: '0x000b39b235b44c53a2e9f0c5d35939d9c8e8dafdd0a2ba2e695b501fc1e9fd2f',
    description: "Dark Shuffle is a turn-based, collectible card game. Build your deck, battle monsters, and explore a procedurally generated world.",
    developer: 'Provable Games',
    genre: 'Digital TCG / Deck Building',
    image: 'https://github.com/Provable-Games/dark-shuffle/blob/main/client/public/favicon.svg',
    name: 'Dark Shuffle',
    publisher: 'Provable Games',
  },
]
```

### Real-time Subscription (Entity-based)

For real-time updates, use the subscription hooks that provide both subscription status AND data in one hook:

```tsx
// IMPROVED API: Get both subscription status AND data in one hook!
const {
  // Subscription status
  isSubscribed,
  error,
  isInitialized,
  
  // Store data with filtering (NOW indexed by game_id!)
  miniGames,
  getMiniGameData,
  getMiniGameByContractAddress,
} = useSubscribeMiniGames({
  // Optional filters:
  game_ids: [1, 2], // Filter by game IDs (NEW!)
  contract_addresses: ['0x123...'], // Filter by specific contract addresses  
  creator_address: '0x456...', // Filter by creator
});

// Mini games are indexed by game_id
console.log(miniGames);
// {
//   "1": {
//     game_id: "1",
//     contract_address: "0x123...",
//     name: "Dark Shuffle", 
//     description: "A great game",
//     developer: "Provable Games",
//     // ... other fields
//   }
// }

// Get specific mini game by game_id
const gameData = getMiniGameData(1);

// Get specific mini game by contract address  
const gameDataByAddress = getMiniGameByContractAddress('0x020fc3c9efd0dde5f53642dac7f53638aeaae98ff9af5f1642546f389ce9dec5');

// Check subscription status
if (!isSubscribed) {
  return <div>Connecting...</div>;
}

if (error) {
  return <div>Error: {error.message}</div>;
}
```

**Same pattern for all subscription hooks:**

```tsx
// Games subscription with data (the main one!)
const { 
  isSubscribed, 
  games, 
  getGameByTokenId,
  isInitialized 
} = useSubscribeGames({
  owner: '0x123...', // Optional filters
  gameAddresses: ['0x456...'],
  tokenIds: ['1', '2'],
  hasContext: true,
});

// Settings subscription with enhanced data
const { 
  isSubscribed, 
  settings, 
  getSettingsData,
  isInitialized 
} = useSubscribeSettings({
  settings_ids: ['1', '2'], // Optional filter
  game_id: 123, // Optional filter by game_id
});

// Settings include rich game metadata:
console.log(settings);
// {
//   "1": {
//     game_id: 123,
//     gameMetadata: {
//       game_id: "123",
//       contract_address: "0x123...",
//       name: "Dark Shuffle",
//       description: "A card game",
//       developer: "Provable Games",
//       publisher: "Provable Games", 
//       genre: "TCG",
//       image: "https://...",
//       // ... complete mini game data
//     },
//     name: "Game Settings", // Parsed from JSON
//     description: "Main game config", // Parsed from JSON
//     data: { maxPlayers: 4, timeLimit: 60 } // Remaining settings data
//   }
// }

// Objectives subscription with data  
const { 
  isSubscribed, 
  objectives, 
  getObjectiveData,
  getObjectivesForGame,
  isInitialized 
} = useSubscribeObjectives({
  game_id: '123', // Optional filter
  objective_ids: ['1', '2'], // Optional filter
});

// Objectives include complete game metadata:
console.log(objectives);
// {
//   "1": {
//     game_id: 123,
//     gameMetadata: {
//       game_id: "123",
//       contract_address: "0x123...",
//       name: "Dark Shuffle",
//       description: "A card game",
//       developer: "Provable Games",
//       // ... complete mini game data
//     },
//     data: "Complete 5 battles"
//   }
// }
```

The improved subscription approach provides:
- **Single hook** for both subscription status and data (no need for separate `useMerged*` hooks)
- **Rich embedded data** with complete game metadata in settings and objectives
- **Self-contained records** - no need for separate lookups to get game information
- Real-time updates when entities change
- Zustand-based local state management
- Built-in filtering capabilities
- Consistent API across all subscription hooks
- Proper error handling and loading states

## License

This project is licensed under the MIT License.
