import { MetagameConfig } from '@metagame-sdk/core';

export class MetagameClient {
  private config: MetagameConfig;

  constructor(config: MetagameConfig) {
    this.config = config;
  }

  public getConfig() {
    return this.config;
  }
}
