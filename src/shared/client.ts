import { SchemaType } from '@dojoengine/sdk';
import { createDojoStore } from '@dojoengine/sdk/react';
import { init, SDK } from '@dojoengine/sdk';

import { MetagameConfig } from './types';

// Default configuration that matches the example app
export const DEFAULT_DOJO_CONFIG = {
  domain: {
    name: 'WORLD_NAME',
    version: '1.0',
    chainId: 'KATANA',
    revision: '1',
  },
};

/**
 * Create a default dojoSDK instance if none is provided
 */
async function createDefaultDojoSDK<S extends SchemaType>(
  config: MetagameConfig<S>
): Promise<SDK<S>> {
  const { toriiUrl, worldAddress, domain = DEFAULT_DOJO_CONFIG.domain } = config;

  if (!worldAddress) {
    throw new Error('worldAddress is required when no dojoSDK is provided');
  }

  if (!toriiUrl) {
    throw new Error('toriiUrl is required when no dojoSDK is provided');
  }

  return await init<S>({
    client: {
      toriiUrl,
      worldAddress,
    },
    domain,
  });
}

export class MetagameClient<T extends SchemaType> {
  private config: MetagameConfig<T>;
  private store: any;
  private namespace: string;
  private tokenAddress: string;

  constructor(config: MetagameConfig<T>) {
    this.config = {
      ...config,
    };

    this.store = createDojoStore<T>();

    this.namespace = 'relayer_0_0_1';
    this.tokenAddress = '0x1fd7f186c0bb99f8d128f1eb40dbe3c7657df381957417f8c9a40804c005545';
  }

  /**
   * Create a MetagameClient instance with optional automatic dojoSDK initialization
   */
  static async create<T extends SchemaType>(config: MetagameConfig<T>): Promise<MetagameClient<T>> {
    let finalConfig = { ...config };

    // If no dojoSDK is provided, create a default one
    if (!config.dojoSDK) {
      try {
        console.log('No dojoSDK provided, creating default dojoSDK...');
        finalConfig.dojoSDK = await createDefaultDojoSDK(config);
        console.log('Default dojoSDK created successfully');
      } catch (error) {
        console.warn('Failed to create default dojoSDK:', error);
        console.log('Continuing without dojoSDK - some subscription features may not work');
      }
    }

    return new MetagameClient(finalConfig);
  }

  /**
   * Get the configuration
   */
  getConfig(): MetagameConfig<T> {
    console.log('[MetagameClient.getConfig] Returning config with toriiUrl:', this.config.toriiUrl);
    return this.config;
  }

  /**
   * Get the store instance
   */
  getStore(): ReturnType<typeof createDojoStore<T>> {
    return this.store;
  }

  /**
   * Get the namespace
   */
  getNamespace(): string {
    return this.namespace;
  }

  /**
   * Get the token address
   */
  getTokenAddress(): string {
    return this.tokenAddress;
  }

  /**
   * Get the Torii URL
   */
  getToriiUrl(): string {
    return this.config.toriiUrl;
  }
}
