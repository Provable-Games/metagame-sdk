import { createDojoConfig } from '@dojoengine/core';

import manifest from './manifest_mainnet.json';

export const dojoConfig = createDojoConfig({
  manifest,
  toriiUrl: 'https://api.cartridge.gg/x/budokan-mainnet/torii',
});
