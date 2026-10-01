import { useState, useEffect, type ReactNode } from 'react';
import type { EffectLevel } from '@/types';
import { EffectsContext } from './effectsContextDef';

export function EffectsProvider({ children }: { children: ReactNode }) {
  // VHS is opt-in: the site starts clean unless the visitor turned VHS on.
  const [effectLevel, setEffectLevel] = useState<EffectLevel>(() => {
    if (typeof window === 'undefined') return 'clean';
    return localStorage.getItem('subcult-effects') === 'full' ? 'full' : 'clean';
  });

  useEffect(() => {
    localStorage.setItem('subcult-effects', effectLevel);
    document.documentElement.setAttribute('data-effects', effectLevel);
  }, [effectLevel]);

  const vhs = effectLevel === 'full';
  const toggleVhs = () => setEffectLevel(vhs ? 'clean' : 'full');

  return (
    <EffectsContext.Provider value={{ effectLevel, setEffectLevel, vhs, toggleVhs }}>
      {children}
    </EffectsContext.Provider>
  );
}
