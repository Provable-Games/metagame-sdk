import { useMemo } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { getContractByName } from '@dojoengine/core';
import { Manifest } from '@dojoengine/core';
import { useNetwork } from '@starknet-react/core';
import { getNamespace } from '../setup/config';

export type DojoManifest = Manifest & any;

export const useDojoSystem = (systemName: string) => {
  const { config } = useDojoSDK();
  const { chain } = useNetwork();
  // need to get namespace from the dojo config somehow, not provided by the default hook
  const namespace = getNamespace(Number(chain.id));
  console.log('namespace', namespace);
  // console.log('config.manifest', config.manifest);
  return useSystem(namespace, systemName, config.manifest);
};

const useSystem = (namespace: string, systemName: string, manifest: DojoManifest) => {
  const { contractAddress, abi } = useMemo(() => {
    const contract = manifest ? getContractByName(manifest, namespace, systemName) : null;
    return {
      contractAddress: contract?.address ?? null,
      abi: contract?.abi ?? null,
    };
  }, [systemName, manifest]);
  return {
    contractAddress,
    abi,
  };
};
