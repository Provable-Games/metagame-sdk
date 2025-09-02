import { useEffect, useState, ReactNode, useMemo } from 'react';
import {
  initMetagame,
  MetagameClient,
  MetagameProvider as MetagameProviderSDK,
} from 'metagame-sdk';
import { useNetwork } from '@starknet-react/core';
import { ChainId, CHAINS } from '../dojo/setup/networks';
import { feltToString } from 'metagame-sdk';
import { manifests } from '../dojo/setup/config';

export const MetagameProvider = ({ children }: { children: ReactNode }) => {
  const [metagameClient, setMetagameClient] = useState<MetagameClient<any> | null>(null);
  const { chain } = useNetwork();

  const chainId = useMemo(() => {
    return feltToString(chain?.id);
  }, [chain]);

  // Get the chain config for the current chain
  const selectedChainConfig = useMemo(() => {
    return CHAINS[chainId! as ChainId];
  }, [chainId]);

  useEffect(() => {
    console.log('selectedChainConfig', selectedChainConfig);
    const manifest = manifests[chainId as ChainId];

    async function initialize() {
      console.log(`[MetagameProvider] Initializing for network: ${chainId}`);
      console.log(`[MetagameProvider] toriiUrl: ${selectedChainConfig.toriiUrl}`);

      // Simple initialization - SDK now handles network changes automatically!
      const metagameClient = await initMetagame({
        toriiUrl: selectedChainConfig.toriiUrl!,
        worldAddress: manifest.world.address,
        tokenAddress: '0x610aba32da98547f9f65fe0195cc60c08f1ef6fa2f2a0fc03e35f1c29319fd3',
      });

      console.log(
        `[MetagameProvider] Metagame client initialized with toriiUrl: ${metagameClient.getToriiUrl()}`
      );
      setMetagameClient(metagameClient);
    }

    initialize();
  }, [selectedChainConfig, chainId]);

  if (!metagameClient) {
    return <div>Loading...</div>;
  }

  return <MetagameProviderSDK metagameClient={metagameClient}>{children}</MetagameProviderSDK>;
};
