import { createContext, useContext, useState, useEffect } from 'react';
import { MetagameClient } from './client';
import { SchemaType } from '@dojoengine/sdk';
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
  metagameClient: MetagameClient<SchemaType>;
  children: React.ReactNode;
}) => {
  const [client, setClient] = useState<MetagameClient<any> | null>(null);

  useEffect(() => {
    setClient(metagameClient);
  }, [metagameClient]);

  if (!client) {
    return <div>Loading Metagame client...</div>;
  }

  // Once we have a client, render the ClientApp with the client in context
  return <MetagameContext.Provider value={client}>{children}</MetagameContext.Provider>;
};
