import { StarknetConfig, jsonRpcProvider } from '@starknet-react/core';
import { ControllerConnector } from '@cartridge/connector';
import { Chain } from '@starknet-react/chains';
import { CHAINS, ChainId, DojoChainConfig, getDefaultChainId } from '../dojo/setup/networks';
import { manifests, namespace } from '../dojo/setup/config';
import { useMemo, useRef } from 'react';
import { DojoManifest } from '../dojo/hooks/useDojoSystem';
import { SessionPolicies } from '@cartridge/controller';
import { stringToFelt, toTitleCase } from '../lib';

// Helper function to clean up Cartridge iframes
function cleanupCartridgeIframes() {
  try {
    const iframes = document.querySelectorAll(
      'iframe[src*="cartridge"], iframe[src*="keychain"], iframe[src*="profile"]'
    );
    iframes.forEach((iframe) => iframe.remove());

    const containers = document.querySelectorAll('[data-cartridge], .cartridge-container');
    containers.forEach((container) => container.remove());
  } catch (error) {
    console.error('Error cleaning up Cartridge iframes:', error);
  }
}

function useDynamicControllerConnector(networkConfig: DojoChainConfig) {
  const previousConnectorRef = useRef<ControllerConnector | null>(null);

  return useMemo(() => {
    // Clean up any existing Cartridge iframes first
    cleanupCartridgeIframes();

    // Clean up previous connector reference
    if (previousConnectorRef.current) {
      previousConnectorRef.current = null;
    }

    // Get all available networks for the connector
    const chainRpcUrls: { rpcUrl: string }[] = Object.values(CHAINS)
      .filter((chain) => chain.chainId !== ChainId.KATANA_LOCAL)
      .map((chain) => ({
        rpcUrl: chain?.chain?.rpcUrls.default.http[0] ?? '',
      }));

    console.log(chainRpcUrls);

    const _makeControllerPolicies = (manifest: DojoManifest): SessionPolicies => {
      const policies: SessionPolicies = { contracts: {} };
      // contracts
      manifest?.contracts?.forEach((contract: any) => {
        if (!policies.contracts) policies.contracts = {};
        policies.contracts[contract.address] = {
          methods: contract.systems
            // .filter((system: string) => !exclusions.includes(system))
            .map((system: string) => ({
              name: toTitleCase(system), // You'll need to implement toTitleCase
              entrypoint: system,
              description: `${contract.tag}::${system}()`,
            })),
        };
      });

      return policies;
    };

    // Create connector
    let connector: ControllerConnector;
    try {
      const policies = _makeControllerPolicies(manifests[networkConfig.chainId as ChainId]);
      connector = new ControllerConnector({
        policies: policies,
        namespace: namespace[networkConfig.chainId as ChainId],
        slot: networkConfig.toriiTokensUrl,
        preset: 'loot-survivor',
        chains: chainRpcUrls,
        defaultChainId: stringToFelt(networkConfig.chainId as string).toString(),
        // tokens: [],
      });

      // Try to manually create the iframe if it doesn't exist in DOM
      const keychainIframe = (connector as any).controller?.iframes?.keychain;
      if (keychainIframe && keychainIframe.iframe && !document.contains(keychainIframe.iframe)) {
        try {
          if (keychainIframe.container && document.contains(keychainIframe.container)) {
            keychainIframe.container.appendChild(keychainIframe.iframe);
          } else if (keychainIframe.container) {
            document.body.appendChild(keychainIframe.container);
          } else {
            document.body.appendChild(keychainIframe.iframe);
          }
        } catch (error) {
          console.error('Error manually appending iframe:', error);
        }
      }
    } catch (error) {
      console.error('Error creating ControllerConnector:', error);
      throw error;
    }

    // Store reference for next cleanup
    previousConnectorRef.current = connector;

    return connector;
  }, [networkConfig]);
}

export const StarknetProvider = ({ children }: { children: React.ReactNode }) => {
  // Create provider with memoization
  const provider = jsonRpcProvider({
    rpc: (chain: Chain) => {
      switch (chain) {
        case CHAINS[ChainId.SN_MAIN].chain:
          return {
            nodeUrl: CHAINS[ChainId.SN_MAIN].chain?.rpcUrls.default.http[0],
          };
        case CHAINS[ChainId.SN_SEPOLIA].chain:
          return {
            nodeUrl: CHAINS[ChainId.SN_SEPOLIA].chain?.rpcUrls.default.http[0],
          };
        case CHAINS[ChainId.WP_GAME_COMPONENTS].chain:
          return {
            nodeUrl: CHAINS[ChainId.WP_GAME_COMPONENTS].chain?.rpcUrls.default.http[0],
          };
        case CHAINS[ChainId.KATANA_LOCAL].chain:
          return {
            nodeUrl: CHAINS[ChainId.KATANA_LOCAL].chain?.rpcUrls.default.http[0],
          };
        default:
          throw new Error(`Unsupported chain: ${chain.network}`);
      }
    },
  });

  const defaultChainId = getDefaultChainId();

  const chains = useMemo(() => {
    if (defaultChainId === ChainId.KATANA_LOCAL) {
      return [CHAINS[ChainId.KATANA_LOCAL].chain!];
    }

    return Object.values(CHAINS)
      .map((chain) => chain.chain!)
      .filter(Boolean); // Filter out any undefined chains
  }, [defaultChainId]);

  const controllerConnector = useDynamicControllerConnector(CHAINS[defaultChainId]);

  return (
    <StarknetConfig chains={chains} connectors={[controllerConnector]} provider={provider}>
      {children}
    </StarknetConfig>
  );
};
