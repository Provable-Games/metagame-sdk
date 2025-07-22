# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Metagame SDK - a TypeScript SDK for interacting with Metagame components in Dojo (a blockchain gaming framework). It provides both static data queries and real-time subscriptions for game tokens, mini-games, settings, and objectives.

## Essential Commands

### Development Commands
```bash
# Install dependencies (using Bun)
bun install

# Build the SDK (ESM + TypeScript definitions)
bun run build

# Type checking
bun run type-check

# Linting
bun run lint

# Format code
bun run format

# Run tests (Note: no test files exist yet)
bun test
```

### Working with Examples
```bash
# Run the basic example
cd examples/vite-react
bun install
bun run dev

# Run the Eternum example
cd examples/vite-react-eternum
bun install
bun run dev
```

## Architecture Overview

### Modular Structure
The SDK is designed with three main modules, each with its own entry point:

1. **Root Module** (`src/index.ts`)
   - Core initialization: `initMetagame()`, `MetagameClient`, `MetagameProvider`
   - Essential types and utilities
   - Re-exports for backward compatibility

2. **SQL Module** (`src/sql/`)
   - One-time data fetching hooks
   - SQL query builders for static data
   - Hooks: `useGameTokens`, `useMiniGames`, `useSettings`, `useObjectives`

3. **Subscriptions Module** (`src/subscriptions/`)
   - Real-time data subscription hooks
   - Zustand stores for state management
   - SDK query builders for live data
   - Hooks: `useSubscribeGameTokens`, `useSubscribeMiniGames`, etc.

### Key Design Patterns

1. **Singleton Client Pattern**: The `MetagameClient` uses a singleton pattern with `getGlobalMetagameClient()` for global access.

2. **Provider Pattern**: React integration through `MetagameProvider` that wraps components needing SDK access.

3. **Store Pattern**: Subscriptions use Zustand stores (`gameTokensStore`, `miniGamesStore`, etc.) for state management.

4. **Modular Imports**: Users can import only what they need:
   ```typescript
   import { initMetagame } from 'metagame-sdk';
   import { useGameTokens } from 'metagame-sdk/sql';
   import { useSubscribeGameTokens } from 'metagame-sdk/subscriptions';
   ```

### Data Flow

1. **Initialization**: `initMetagame()` sets up the Dojo SDK client and creates the MetagameClient instance
2. **Static Queries**: SQL hooks fetch data once using the Dojo torii client
3. **Real-time Subscriptions**: Subscription hooks maintain live data streams through SDK queries and Zustand stores
4. **Data Transformation**: Raw data from Dojo is transformed using utilities in `src/shared/utils.ts`

### Important Files

- `src/shared/MetagameClient.ts`: Core client class that wraps Dojo SDK
- `src/shared/types.ts`: All TypeScript type definitions
- `src/shared/utils.ts`: Data transformation utilities
- `src/sql/service.ts`: SQL query execution logic
- `src/subscriptions/stores.ts`: Zustand store definitions

### Integration Points

The SDK integrates with:
- **Dojo SDK**: For blockchain interactions (`@dojoengine/sdk`)
- **Starknet**: For wallet connections (`starknet` and `@starknet-react/core`)
- **React**: Through hooks and providers
- **Zustand**: For subscription state management

### Current Limitations

1. **No Test Infrastructure**: Test script exists but no test files are implemented
2. **No Contributing Guidelines**: CONTRIBUTING.md referenced but doesn't exist
3. **Limited Documentation**: API documentation is minimal beyond the README

### Development Tips

1. When adding new features, maintain the modular structure - decide if it's a SQL query, subscription, or core functionality
2. All data transformations should go through the utilities in `src/shared/utils.ts`
3. Follow the existing hook patterns when creating new hooks
4. Use the type definitions in `src/shared/types.ts` consistently
5. Example applications in `/examples/` are good for testing changes