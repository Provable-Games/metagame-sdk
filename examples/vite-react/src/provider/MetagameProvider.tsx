import { useEffect, useState, ReactNode } from 'react';
import {
  initMetagame,
  MetagameClient,
  MetagameProvider as MetagameProviderSDK,
} from 'metagame-sdk';
import { useProvider } from '@starknet-react/core';
import { dojoConfig } from '../../dojoConfig';

export const MetagameProvider = ({ children }: { children: ReactNode }) => {
  const [metagameClient, setMetagameClient] = useState<MetagameClient<any> | null>(null);
  const { provider } = useProvider();

  useEffect(() => {
    if (!provider) return;

    async function initialize() {
      // Use the new automatic dojoSDK feature!
      const metagameClient = await initMetagame({
        toriiUrl: dojoConfig.toriiUrl,
        provider: provider,
        worldAddress: dojoConfig.manifest.world.address, // Automatic dojoSDK creation
        // Optional: Override defaults if needed
        // relayUrl: dojoConfig.relayUrl,
        // domain: { name: 'CUSTOM_WORLD', version: '1.0', chainId: 'KATANA', revision: '1' }
      });

      setMetagameClient(metagameClient);
    }

    initialize();
  }, [provider]);

  if (!metagameClient) {
    return <div>Loading...</div>;
  }

  return <MetagameProviderSDK metagameClient={metagameClient}>{children}</MetagameProviderSDK>;
};
