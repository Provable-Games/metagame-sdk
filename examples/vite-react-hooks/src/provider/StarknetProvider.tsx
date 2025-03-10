import { StarknetConfig, jsonRpcProvider } from '@starknet-react/core';
import { mainnet } from '@starknet-react/chains';
import { ControllerConnector } from '@cartridge/connector';
import { useCallback } from 'react';

const controllerConnector = new ControllerConnector({
  chains: [{ rpcUrl: 'https://api.cartridge.gg/x/starknet/mainnet' }],
  defaultChainId: '0x534e5f4d41494e',
});

export const StarknetProvider = ({ children }: { children: React.ReactNode }) => {
  const rpc = useCallback(() => {
    return { nodeUrl: 'https://api.cartridge.gg/x/starknet/mainnet' };
  }, []);

  return (
    <StarknetConfig
      chains={[mainnet]}
      connectors={[controllerConnector]}
      provider={jsonRpcProvider({ rpc })}
    >
      {children}
    </StarknetConfig>
  );
};
