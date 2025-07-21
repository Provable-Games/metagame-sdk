import { useEffect, useState, ReactNode } from 'react';
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

  useEffect(() => {
    const chainId = feltToString(chain.id);
    const selectedChainConfig = CHAINS[chainId as ChainId];
    const manifest = manifests[chainId as ChainId];

    async function initialize() {
      // Simple initialization - no provider required!
      const metagameClient = await initMetagame({
        toriiUrl: selectedChainConfig.toriiUrl!,
        worldAddress: manifest.world.address,
      });

      setMetagameClient(metagameClient);
    }

    initialize();
  }, []);

  if (!metagameClient) {
    return <div>Loading...</div>;
  }

  return <MetagameProviderSDK metagameClient={metagameClient}>{children}</MetagameProviderSDK>;
};
