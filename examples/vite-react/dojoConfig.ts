import { createDojoConfig } from '@dojoengine/core';

import manifest from './manifest_mainnet.json';

export const dojoConfig = createDojoConfig({
  manifest,
  toriiUrl: import.meta.env.VITE_TORII_URL,
});
