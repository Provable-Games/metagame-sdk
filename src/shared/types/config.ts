import { SDK, SchemaType } from '@dojoengine/sdk';
import { ToriiClient } from '@dojoengine/torii-client';

/**
 * Configuration interface for the SDK.
 */
export interface MetagameConfig<T extends SchemaType> {
  toriiUrl: string;
  dojoSDK?: SDK<T>;
  toriiClient?: ToriiClient;
  namespace?: string; // Optional namespace, defaults to 'denshokan_0_0_1'

  // Optional fields for default dojoSDK creation
  worldAddress?: string;
  relayUrl?: string;
  domain?: {
    name: string;
    version: string;
    chainId: string;
    revision: string;
  };
}
