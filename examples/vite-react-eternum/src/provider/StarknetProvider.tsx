import { StarknetConfig, jsonRpcProvider } from '@starknet-react/core';
import { sepolia } from '@starknet-react/chains';
import { ControllerConnector } from '@cartridge/connector';
import { useCallback } from 'react';

const controllerConnector = new ControllerConnector({
  chains: [{ rpcUrl: 'https://api.cartridge.gg/x/starknet/sepolia' }],
  defaultChainId: '0x534e5f5345504f4c4941',
});

export const StarknetProvider = ({ children }: { children: React.ReactNode }) => {
  const rpc = useCallback(() => {
    return { nodeUrl: 'https://api.cartridge.gg/x/starknet/sepolia' };
  }, []);

  return (
    <StarknetConfig
      chains={[sepolia]}
      connectors={[controllerConnector]}
      provider={jsonRpcProvider({ rpc })}
    >
      {children}
    </StarknetConfig>
  );
};
