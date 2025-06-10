import { SchemaType } from '@dojoengine/sdk';
import { createDojoStore } from '@dojoengine/sdk/react';
import { Account, RpcProvider } from 'starknet';
import { init, SDK } from '@dojoengine/sdk';

import { MetagameConfig } from './types';
import { executeSqlQuery } from '../sql/services/sqlService';
import { miniGamesQuery } from '../sql/queries/sql';

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
  private contractAddress: string;

  constructor(config: MetagameConfig<T>) {
    this.config = {
      ...config,
    };

    this.store = this.config.store || createDojoStore<T>();

    this.namespace = 'denshokan_0_0_1';
    this.contractAddress = '0x50d5db3a00209bbcd8b7f5fbec727d36515485fb2859c257616d019a166f99';
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
   * Get the contract address
   */
  getContractAddress(): string {
    return this.contractAddress;
  }

  /**
   * Get the Torii URL
   */
  getToriiUrl(): string {
    return this.config.toriiUrl;
  }

  /**
   * Get mini games
   */
  async getMiniGames(
    limit: number,
    offset: number,
    logging: boolean = false
  ): Promise<{ data: any[]; error: string | null }> {
    return executeSqlQuery(
      this.config.toriiUrl,
      miniGamesQuery({ namespace: this.namespace, limit, offset }),
      logging
    );
  }
}
