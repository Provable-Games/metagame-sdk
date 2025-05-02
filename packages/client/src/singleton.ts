import { MetagameClient } from './client';
import { MetagameConfig } from '@metagame-sdk/core';

let clientInstance: MetagameClient | null = null;

export function initMetagame(config: MetagameConfig): MetagameClient {
  clientInstance = new MetagameClient(config);
  return clientInstance;
}

export function getMetagameClient(): MetagameClient {
  if (!clientInstance) {
    throw new Error('Metagame client has not been initialized. Call initMetagame first.');
  }
  return clientInstance;
}
