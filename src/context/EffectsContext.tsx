import { useState, useEffect, type ReactNode } from 'react';
import type { EffectLevel } from '@/types';
import { EffectsContext } from './effectsContextDef';

export function EffectsProvider({ children }: { children: ReactNode }) {
  const [effectLevel, setEffectLevel] = useState<EffectLevel>(() => {
    if (typeof window === 'undefined') return 'mild';
    const saved = localStorage.getItem('subcult-effects');
    if (saved === 'clean' || saved === 'mild' || saved === 'full') return saved;
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'clean';
    // Mild is the documented default (see README Effects section)
    return 'mild';
  });

  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('subcult-contrast') === 'high';
  });

  useEffect(() => {
    localStorage.setItem('subcult-effects', effectLevel);
    document.documentElement.setAttribute('data-effects', effectLevel);
  }, [effectLevel]);

  useEffect(() => {
    localStorage.setItem('subcult-contrast', highContrast ? 'high' : 'normal');
    document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
  }, [highContrast]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  return (
    <EffectsContext.Provider
      value={{ effectLevel, setEffectLevel, highContrast, toggleHighContrast }}
    >
      {children}
    </EffectsContext.Provider>
  );
}
