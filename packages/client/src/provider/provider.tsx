import React, { createContext, useContext, ReactNode } from 'react';
import { MetagameClient } from '../client';

interface MetagameContextType {
  client: MetagameClient | null;
}

const MetagameContext = createContext<MetagameContextType>({ client: null });

export const useMetagame = () => useContext(MetagameContext);

interface MetagameProviderProps {
  client: MetagameClient;
  children: ReactNode;
}

export const MetagameProvider: React.FC<MetagameProviderProps> = ({ client, children }) => {
  return <MetagameContext.Provider value={{ client }}>{children}</MetagameContext.Provider>;
};
