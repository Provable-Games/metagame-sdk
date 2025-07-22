import { SchemaType } from '@dojoengine/sdk';
import { MetagameClient } from './client';
import { MetagameConfig } from './types/config';
import { clearAllStores } from '../subscriptions/stores';

// Store the singleton instance
let metagameClientInstance: MetagameClient<any> | null = null;
let isInitialized = false;
let currentConfig: MetagameConfig<any> | null = null;
let isInitializing = false;

/**
 * Initialize the Metagame SDK with configuration
 * This should be called once at the start of your application
 */
export async function initMetagame<T extends SchemaType>(
  config: MetagameConfig<T>
): Promise<MetagameClient<T>> {
  // Check if config has changed (network switch)
  if (metagameClientInstance && isInitialized && currentConfig) {
    const configChanged = 
      currentConfig.toriiUrl !== config.toriiUrl || 
      currentConfig.worldAddress !== config.worldAddress;
    
    if (configChanged) {
      console.log('[initMetagame] Config changed, reinitializing SDK');
      console.log('[initMetagame] Old config:', { toriiUrl: currentConfig.toriiUrl, worldAddress: currentConfig.worldAddress });
      console.log('[initMetagame] New config:', { toriiUrl: config.toriiUrl, worldAddress: config.worldAddress });
      
      // Mark as initializing to prevent errors during transition
      isInitializing = true;
      
      // Clear all stores when config changes
      clearAllStores();
      
      // Reset the instance
      metagameClientInstance = null;
      isInitialized = false;
    } else {
      return metagameClientInstance as MetagameClient<T>;
    }
  }

  isInitializing = true;
  metagameClientInstance = await MetagameClient.create<T>(config);
  isInitialized = true;
  isInitializing = false;
  currentConfig = config;
  return metagameClientInstance;
}

/**
 * Initialize the Metagame SDK synchronously (legacy method)
 * Use initMetagame() for better dojoSDK auto-initialization
 */
export function initMetagameSync<T extends SchemaType>(
  config: MetagameConfig<T>
): MetagameClient<T> {
  // Check if config has changed (network switch)
  if (metagameClientInstance && isInitialized && currentConfig) {
    const configChanged = 
      currentConfig.toriiUrl !== config.toriiUrl || 
      currentConfig.worldAddress !== config.worldAddress;
    
    if (configChanged) {
      console.log('[initMetagameSync] Config changed, reinitializing SDK');
      console.log('[initMetagameSync] Old config:', { toriiUrl: currentConfig.toriiUrl, worldAddress: currentConfig.worldAddress });
      console.log('[initMetagameSync] New config:', { toriiUrl: config.toriiUrl, worldAddress: config.worldAddress });
      
      // Clear all stores when config changes
      clearAllStores();
      
      // Reset the instance
      metagameClientInstance = null;
      isInitialized = false;
    } else {
      return metagameClientInstance as MetagameClient<T>;
    }
  }

  metagameClientInstance = new MetagameClient<T>(config);
  isInitialized = true;
  currentConfig = config;
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
  console.log('[getMetagameClient] Returning singleton instance with toriiUrl:', metagameClientInstance.getToriiUrl());
  return metagameClientInstance as MetagameClient<T>;
}

/**
 * Get the initialized Metagame client instance safely
 * Returns null if not initialized instead of throwing
 */
export function getMetagameClientSafe<T extends SchemaType>(): MetagameClient<T> | null {
  if (!metagameClientInstance || !isInitialized || isInitializing) {
    console.log('[getMetagameClientSafe] SDK not ready:', { 
      hasInstance: !!metagameClientInstance, 
      isInitialized, 
      isInitializing 
    });
    return null;
  }
  return metagameClientInstance as MetagameClient<T>;
}

/**
 * Check if the SDK is initialized and ready
 */
export function isMetagameReady(): boolean {
  return !!metagameClientInstance && isInitialized && !isInitializing;
}

/**
 * Reset the Metagame SDK instance
 * Useful for testing or when you need to reinitialize with different config
 */
export function resetMetagame(): void {
  console.log('[resetMetagame] Resetting SDK instance and clearing stores');
  clearAllStores();
  metagameClientInstance = null;
  isInitialized = false;
  isInitializing = false;
  currentConfig = null;
}
