import { useEffect, useState, ReactNode } from 'react';
import {
  initMetagame,
  MetagameClient,
  MetagameProvider as MetagameProviderSDK,
} from 'metagame-sdk';
import { dojoConfig } from '../../dojoConfig';
import { SchemaType } from '../bindings/models.gen';
import { useDojoSDK } from '@dojoengine/sdk/react';

export const MetagameProvider = ({ children }: { children: ReactNode }) => {
  const [metagameClient, setMetagameClient] = useState<MetagameClient<any> | null>(null);
  const {
    sdk: { client },
  } = useDojoSDK();

  useEffect(() => {
    async function initialize() {
      // Simple initialization - no provider required!
      // Can optionally pass existing dojoSDK client for better integration
      const metagameClient = await initMetagame<SchemaType>({
        toriiUrl: dojoConfig.toriiUrl,
        toriiClient: client,
        worldAddress: dojoConfig.manifest.world.address,
      });

      setMetagameClient(metagameClient);
    }

    initialize();
  }, [client]);

  if (!metagameClient) {
    return <div>Loading...</div>;
  }

  return <MetagameProviderSDK metagameClient={metagameClient!}>{children}</MetagameProviderSDK>;
};
