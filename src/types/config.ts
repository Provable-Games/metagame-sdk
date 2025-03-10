import { SDK, SchemaType } from '@dojoengine/sdk';
import { ProviderInterface } from 'starknet';

/**
 * Configuration interface for the SDK.
 */
export interface MetagameConfig<T extends SchemaType> {
  dojoSDK: SDK<T>;
  toriiUrl: string;
  provider: ProviderInterface;
  store?: any;
}
