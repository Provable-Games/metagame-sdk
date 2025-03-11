import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MetagameClient } from './client';

const MetagameContext = createContext<MetagameClient<any> | null>(null);

export const useMetagame = () => {
  const context = useContext(MetagameContext);
  if (!context) {
    throw new Error('useMetagame must be used within a MetagameProvider');
  }
  return context;
};

export const MetagameProvider = ({
  metagameClient,
  children,
}: {
  metagameClient: MetagameClient<any>;
  children: any;
}) => {
  const [client, setClient] = useState<MetagameClient<any> | null>(null);

  useEffect(() => {
    setClient(metagameClient);
  }, [metagameClient]);

  if (!client) {
    return <div>Loading Metagame client...</div>;
  }

  return <MetagameContext.Provider value={client}>{children}</MetagameContext.Provider>;
};
