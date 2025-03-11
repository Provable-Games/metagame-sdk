import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { init, SDK } from '@dojoengine/sdk';
import { DojoSdkProvider } from '@dojoengine/sdk/react';
import type { SchemaType } from './bindings/models.gen.ts';
import { setupWorld } from './bindings/contracts.gen.ts';
import './index.css';
import { dojoConfig } from '../dojoConfig.ts';
import { MetagameProvider } from './provider/MetagameProvider.tsx';
import { StarknetProvider } from './provider/StarknetProvider.tsx';
import App from './App.tsx';

function Root() {
  const [sdk, setSdk] = useState<SDK<SchemaType> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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

      setSdk(dojoSdk);
      setIsInitialized(true);
    }

    initialize();
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <StarknetProvider>
      <DojoSdkProvider sdk={sdk!} dojoConfig={dojoConfig} clientFn={setupWorld}>
        <MetagameProvider dojoSdk={sdk!}>
          <App />
        </MetagameProvider>
      </DojoSdkProvider>
    </StarknetProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
