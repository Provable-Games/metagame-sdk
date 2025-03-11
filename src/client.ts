import { SchemaType } from '@dojoengine/sdk';
import { createDojoStore } from '@dojoengine/sdk/react';

import { MetagameConfig } from './types';
import { executeSqlQuery } from './services/sqlService';
import { gameDataQuery, miniGamesQuery } from './queries/sql';

export class MetagameClient<T extends SchemaType> {
  private config: MetagameConfig<T>;
  private store: any;

  constructor(config: MetagameConfig<T>) {
    this.config = {
      ...config,
    };

    this.store = this.config.store || createDojoStore<T>();
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
    return executeSqlQuery(this.config.toriiUrl, miniGamesQuery(limit, offset), logging);
  }

  /**
   * Get mini games
   */
  async getGameData(
    gameNamespaces: string[],
    logging: boolean = false
  ): Promise<{ data: any[]; error: string | null }> {
    return executeSqlQuery(this.config.toriiUrl, gameDataQuery(gameNamespaces), logging);
  }
}
