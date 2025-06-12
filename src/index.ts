// ===== CORE SDK SETUP (Root Level Exports) =====
// These are the essential functions and types needed to set up the SDK
export { MetagameClient } from './shared/client';
export { getMetagameClient, initMetagame, resetMetagame } from './shared/singleton';
export { useMetagame, MetagameProvider } from './shared/provider';

// ===== ESSENTIAL TYPES =====
// Core types that users need for setup and configuration
export type { MetagameConfig } from './shared/types/config';
export type { GameTokenData, GameMetadata, GameSettings, GameObjective } from './shared/types';

// ===== UTILITIES =====
// Common utility functions
export { feltToString, stringToFelt, bigintToHex, indexAddress } from './shared/lib';

// ===== BACKWARD COMPATIBILITY =====
// Re-export some commonly used hooks for backward compatibility
// But encourage users to use modular imports: 'metagame-sdk/subscriptions' or 'metagame-sdk/sql'
export { useSubscribeGameTokens } from './subscriptions/hooks/useSubscribeGameTokens';
export { useGameTokens } from './sql/hooks/useGameTokens';

// ===== MODULAR IMPORTS AVAILABLE =====
// Users should import hooks from these subpaths for better tree-shaking:
//
// Subscription hooks (real-time data):
// import { useSubscribeGameTokens, useSubscribeMiniGames } from 'metagame-sdk/subscriptions';
//
// SQL hooks (static queries):
// import { useGameTokens, useMiniGames } from 'metagame-sdk/sql';
//
// Advanced utilities:
// import { mergeGameEntities, parseContextData } from 'metagame-sdk/shared';
