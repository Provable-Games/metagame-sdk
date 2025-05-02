// Core types
export interface MetagameConfig {
  rpcUrl: string;
  chainId: string;
  namespace: string;
}

export interface Score {
  game_id: number;
  score: number;
}
