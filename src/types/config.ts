import { SDK, SchemaType } from '@dojoengine/sdk';
import { ProviderInterface } from 'starknet';

/**
 * Configuration interface for the SDK.
 */
export interface MetagameConfig<T extends SchemaType> {
  toriiUrl: string;
  provider: ProviderInterface;
  dojoSDK?: SDK<T>;
  store?: any;
}
