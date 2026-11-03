import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { EffectsProvider } from '@/context/EffectsContext';
import { AuthProvider } from '@/context/AuthContext';
import App from '@/App';

/** The browser tree: what src/main.tsx mounts or hydrates into #root. */
export default function AppRoot() {
  return (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <EffectsProvider>
            <App />
          </EffectsProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
