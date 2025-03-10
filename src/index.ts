import { MetagameClient } from './client';

export { useMetagame, MetagameProvider } from './provider';

// Export types
export * from './types';

// Export hooks
export * from './hooks';

export { getMetagameClient, initMetagame } from './singleton';

// Export the client class directly for advanced usage
export { MetagameClient };
