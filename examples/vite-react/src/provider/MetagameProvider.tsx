import { useEffect, useState, ReactNode } from 'react';
import {
  initMetagame,
  MetagameClient,
  MetagameProvider as MetagameProviderSDK,
} from 'metagame-sdk';
import { dojoConfig } from '../../dojoConfig';

export const MetagameProvider = ({ children }: { children: ReactNode }) => {
  const [metagameClient, setMetagameClient] = useState<MetagameClient<any> | null>(null);

  useEffect(() => {
    async function initialize() {
      // Simple initialization - no provider required!
      const metagameClient = await initMetagame({
        toriiUrl: dojoConfig.toriiUrl,
        worldAddress: dojoConfig.manifest.world.address, // Automatic dojoSDK creation
        // Optional: Override defaults if needed
        // relayUrl: dojoConfig.relayUrl,
        // domain: { name: 'CUSTOM_WORLD', version: '1.0', chainId: 'KATANA', revision: '1' }
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
