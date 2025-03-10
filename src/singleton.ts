import { SchemaType } from '@dojoengine/sdk';
import { MetagameClient } from './client';
import { MetagameConfig } from './types/config';
import { createDojoStore } from '@dojoengine/sdk/react';

// Store the singleton instance
let metagameClientInstance: MetagameClient<any> | null = null;
let isInitialized = false;

/**
 * Initialize the Metagame SDK with configuration
 * This should be called once at the start of your application
 */
export function initMetagame<T extends SchemaType>(config: MetagameConfig<T>): MetagameClient<T> {
  if (metagameClientInstance && isInitialized) {
    console.warn(
      'Metagame SDK is already initialized. To reinitialize, call resetMetagame() first.'
    );
    return metagameClientInstance as MetagameClient<T>;
  }

  metagameClientInstance = new MetagameClient<T>(config);
  isInitialized = true;
  return metagameClientInstance;
}

/**
 * Get the initialized Metagame client instance
 * Throws an error if the SDK hasn't been initialized
 */
export function getMetagameClient<T extends SchemaType>(): MetagameClient<T> {
  if (!metagameClientInstance || !isInitialized) {
    throw new Error(
      'Metagame SDK is not initialized. Call initMetagame() before using getMetagameClient().'
    );
  }
  return metagameClientInstance as MetagameClient<T>;
}

/**
 * Reset the Metagame SDK instance
 * Useful for testing or when you need to reinitialize with different config
 */
export function resetMetagame(): void {
  metagameClientInstance = null;
  isInitialized = false;
}
