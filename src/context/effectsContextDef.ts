import { createContext } from 'react';
import type { EffectLevel } from '@/types';

export interface EffectsContextValue {
  effectLevel: EffectLevel;
  setEffectLevel: (level: EffectLevel) => void;
  /** VHS mode: scanlines, noise, and a tracking bar over the whole site. */
  vhs: boolean;
  toggleVhs: () => void;
}

export const EffectsContext = createContext<EffectsContextValue | null>(null);
