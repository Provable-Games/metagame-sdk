// Main exports (backward compatibility)
export { useMetagame, MetagameProvider } from './shared/provider';
export { getMetagameClient, initMetagame } from './shared/singleton';
export { MetagameClient } from './shared/client';

// Re-export shared utilities and types
export { feltToString, stringToFelt, bigintToHex, indexAddress } from './shared/lib';
export type * from './shared/types/entities';
export type * from './shared/types/lookup';
