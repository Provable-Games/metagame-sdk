import { useEffect, useState, ReactNode } from 'react';
import {
  initMetagame,
  MetagameClient,
  MetagameProvider as MetagameProviderSDK,
} from 'metagame-sdk';
import { useProvider } from '@starknet-react/core';
import { dojoConfig } from '../../dojoConfig';
import { SchemaType } from '../bindings/models.gen';
import { useDojoSDK } from '@dojoengine/sdk/react';

export const MetagameProvider = ({ children }: { children: ReactNode }) => {
  const [metagameClient, setMetagameClient] = useState<MetagameClient<any> | null>(null);
  const { provider } = useProvider();
  const {
    sdk: { client },
  } = useDojoSDK();
  useEffect(() => {
    async function initialize() {
      const metagameClient = initMetagame<SchemaType>({
        toriiUrl: dojoConfig.toriiUrl,
        provider: provider,
        toriiClient: client,
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
