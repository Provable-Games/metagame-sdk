import { SDK, SchemaType } from '@dojoengine/sdk';
import { ToriiClient } from '@dojoengine/torii-client';
import { LoggerConfig } from '../utils/logger';

/**
 * Configuration interface for the SDK.
 */
export interface MetagameConfig<T extends SchemaType> {
  toriiUrl: string;
  dojoSDK?: SDK<T>;
  toriiClient?: ToriiClient;
  namespace?: string; // Optional namespace, defaults to 'relayer_0_0_1'
  tokenAddress?: string; // Optional denshokan token address

  // Optional fields for default dojoSDK creation
  worldAddress?: string;
  relayUrl?: string;
  domain?: {
    name: string;
    version: string;
    chainId: string;
    revision: string;
  };

  // Optional logging configuration
  logging?: Partial<LoggerConfig>;
}
