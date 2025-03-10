import { useEffect, useState } from 'react';
import {
  initMetagame,
  MetagameClient,
  MetagameProvider as MetagameProviderSDK,
} from 'metagame-sdk';
import { useProvider } from '@starknet-react/core';
import { dojoConfig } from '../../dojoConfig';
import { SchemaType } from '../bindings/models.gen';
import { init } from '@dojoengine/sdk';

export const MetagameProvider = ({ children }: { children: React.ReactNode }) => {
  const [metagameClient, setMetagameClient] = useState<MetagameClient<any> | null>(null);
  const { provider } = useProvider();

  useEffect(() => {
    async function initialize() {
      const dojoSdk = await init<SchemaType>({
        client: {
          toriiUrl: dojoConfig.toriiUrl,
          relayUrl: dojoConfig.relayUrl,
          worldAddress: dojoConfig.manifest.world.address,
        },
        domain: {
          name: 'WORLD_NAME',
          version: '1.0',
          chainId: 'KATANA',
          revision: '1',
        },
      });

      const metagameClient = initMetagame<SchemaType>({
        dojoSDK: dojoSdk as any,
        toriiUrl: dojoConfig.toriiUrl,
        provider: provider,
      });

      setMetagameClient(metagameClient);
    }

    initialize();
  }, []);

  if (!metagameClient) {
    return <div>Loading...</div>;
  }

  return <MetagameProviderSDK metagameClient={metagameClient!}>{children}</MetagameProviderSDK>;
};
