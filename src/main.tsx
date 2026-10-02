import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { EffectsProvider } from '@/context/EffectsContext';
import { AuthProvider } from '@/context/AuthContext';
import App from '@/App';
import { installCampaignLinkTracking } from '@/lib/analytics';
import '@/index.css';
import '@/styles/subcult-brand.css';

installCampaignLinkTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EffectsProvider>
          <App />
        </EffectsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
