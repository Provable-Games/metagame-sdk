import { ReactNode, useEffect, useMemo, useState } from 'react';
import { init, SDK } from '@dojoengine/sdk';
import type { SchemaType } from '../bindings/models.gen.ts';
import { ChainId, CHAINS } from '../dojo/setup/networks';
import { feltToString } from 'metagame-sdk';
import { useNetwork } from '@starknet-react/core';
import { DojoSdkProvider } from '@dojoengine/sdk/react';
import { setupWorld } from '../bindings/contracts.gen.ts';
import { manifests } from '../dojo/setup/config.ts';
import { createDojoConfig } from '@dojoengine/core';

export const DojoProvider = ({ children }: { children: ReactNode }) => {
  const [sdk, setSdk] = useState<SDK<SchemaType> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { chain } = useNetwork();

  const chainId = useMemo(() => {
    return feltToString(chain?.id);
  }, [chain]);

  // Get the chain config for the current chain
  const selectedChainConfig = useMemo(() => {
    return CHAINS[chainId! as ChainId];
  }, [chainId]);

  const manifest = manifests[chainId as ChainId];

  const dojoConfig = createDojoConfig({
    manifest,
    toriiUrl: selectedChainConfig.toriiUrl,
  });

  console.log(manifests);
  console.log(chainId);

  useEffect(() => {
    async function initialize() {
      const dojoSdk = await init<SchemaType>({
        client: {
          toriiUrl: selectedChainConfig.toriiUrl,
          relayUrl: selectedChainConfig.relayUrl,
          worldAddress: manifest.world.address,
        },
        domain: {
          name: 'WORLD_NAME',
          version: '1.0',
          chainId: 'KATANA',
          revision: '1',
        },
      });

      setSdk(dojoSdk);
      setIsInitialized(true);
    }

    initialize();
  }, []);

  console.log(dojoConfig);

  return (
    <DojoSdkProvider sdk={sdk!} dojoConfig={dojoConfig} clientFn={setupWorld}>
      {children}
    </DojoSdkProvider>
  );
};
