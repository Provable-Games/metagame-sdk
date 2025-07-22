import { StarknetDomain } from 'starknet';
import { DojoManifest } from '../hooks/useDojoSystem';
import relayer_manifest_slot from '../../../manifest_slot.json';
import relayer_manifest_mainnet from '../../../manifest_mainnet.json';
import { ChainId, CHAINS } from '../setup/networks';
import { feltToString } from 'metagame-sdk';

export interface DojoAppConfig {
  selectedChainId: ChainId;
  namespace: string;
  starknetDomain: StarknetDomain;
  manifest: DojoManifest;
}

export const manifests: Record<ChainId, DojoManifest> = {
  [ChainId.KATANA_LOCAL]: relayer_manifest_slot as DojoManifest,
  [ChainId.WP_GAME_COMPONENTS]: relayer_manifest_slot as DojoManifest,
  [ChainId.SN_MAIN]: relayer_manifest_mainnet as DojoManifest,
  [ChainId.SN_SEPOLIA]: relayer_manifest_mainnet as DojoManifest,
};

export const namespace: Record<ChainId, string> = {
  [ChainId.KATANA_LOCAL]: 'relayer_0_0_1',
  [ChainId.WP_GAME_COMPONENTS]: 'relayer_0_0_1',
  [ChainId.SN_MAIN]: 'relayer_0_0_1',
  [ChainId.SN_SEPOLIA]: 'relayer_0_0_1',
};

export const isChainIdSupported = (chainId: ChainId): boolean => {
  return Object.keys(CHAINS).includes(chainId);
};

// starknet domain
export const makeStarknetDomain = (chainId: ChainId): StarknetDomain => ({
  name: 'Budokan Relayer',
  version: '0.1.0',
  chainId: CHAINS[chainId].chainId,
  revision: '1',
});

//------------------------

export const makeDojoAppConfig = (chainId: ChainId): DojoAppConfig => {
  return {
    selectedChainId: chainId,
    manifest: manifests[chainId],
    namespace: namespace[chainId],
    starknetDomain: makeStarknetDomain(chainId),
  };
};

export const getNamespace = (chainId: number): string => {
  const chainIdString = feltToString(chainId);
  return namespace[chainIdString as ChainId];
};
