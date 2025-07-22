import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { MetagameProvider } from './provider/MetagameProvider.tsx';
import { StarknetProvider } from './provider/StarknetProvider.tsx';
import App from './App.tsx';
import { DojoProvider } from './provider/DojoProvider.tsx';

function Root() {
  return (
    <StarknetProvider>
      <DojoProvider>
        <MetagameProvider>
          <App />
        </MetagameProvider>
      </DojoProvider>
    </StarknetProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
