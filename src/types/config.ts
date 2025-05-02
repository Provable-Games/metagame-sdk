import { SDK, SchemaType } from '@dojoengine/sdk';
import { ProviderInterface } from 'starknet';
import { ToriiClient } from '@dojoengine/torii-client';

/**
 * Configuration interface for the SDK.
 */
export interface MetagameConfig<T extends SchemaType> {
  toriiUrl: string;
  provider: ProviderInterface;
  dojoSDK?: SDK<T>;
  toriiClient?: ToriiClient;
  store?: any;
}
