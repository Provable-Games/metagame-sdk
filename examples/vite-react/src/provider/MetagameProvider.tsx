import { useEffect, useState, ReactNode } from 'react';
import {
  initMetagame,
  MetagameClient,
  MetagameProvider as MetagameProviderSDK,
} from 'metagame-sdk';
import { useProvider } from '@starknet-react/core';
import { dojoConfig } from '../../dojoConfig';
import { SchemaType } from '../bindings/models.gen';
import { SDK } from '@dojoengine/sdk';

export const MetagameProvider = ({
  dojoSdk,
  children,
}: {
  dojoSdk: SDK<SchemaType>;
  children: ReactNode;
}) => {
  const [metagameClient, setMetagameClient] = useState<MetagameClient<any> | null>(null);
  const { provider } = useProvider();

  useEffect(() => {
    async function initialize() {
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
