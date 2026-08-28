import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useEffects } from '@/context/useEffects';
import type { EffectLevel } from '@/types';

const NAV_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/zine', label: 'Field Notes' },
  { to: '/about', label: 'About' },
  { to: '/support', label: 'Support' },
];

const EFFECT_LABELS: Record<EffectLevel, string> = {
  clean: 'CLEAN',
  mild: 'GLITCH',
  full: 'VHS',
};

const EFFECT_CYCLE: EffectLevel[] = ['clean', 'mild', 'full'];

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { effectLevel, setEffectLevel, highContrast, toggleHighContrast } = useEffects();

  const cycleEffects = () => {
    const currentIndex = EFFECT_CYCLE.indexOf(effectLevel);
    const next = EFFECT_CYCLE[(currentIndex + 1) % EFFECT_CYCLE.length];
    setEffectLevel(next);
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-void/95 backdrop-blur-sm border-b border-fog"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-xl font-bold tracking-[0.2em] text-glow hover:text-signal transition-colors no-underline"
          >
            SUBCULT
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-mono text-xs uppercase tracking-wider transition-colors no-underline ${
                    isActive ? 'text-signal' : 'text-bone hover:text-glow'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Effect toggle */}
            <button
              onClick={cycleEffects}
              className="font-mono text-xs px-2 py-1 border border-fog text-dust hover:text-static hover:border-static transition-colors duration-200 cursor-pointer"
              aria-label={`Visual effects: ${EFFECT_LABELS[effectLevel]}. Select to cycle.`}
              title={`Effects: ${EFFECT_LABELS[effectLevel]}`}
            >
              FX:{EFFECT_LABELS[effectLevel]}
            </button>

            {/* Contrast toggle */}
            <button
              onClick={toggleHighContrast}
              className="font-mono text-xs px-2 py-1 border border-fog text-dust hover:text-flicker hover:border-flicker transition-colors duration-200 cursor-pointer"
              aria-label={`High contrast: ${highContrast ? 'on' : 'off'}`}
              title={`Contrast: ${highContrast ? 'HIGH' : 'NORMAL'}`}
            >
              {highContrast ? 'HC:ON' : 'HC:OFF'}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden font-mono text-sm text-bone hover:text-signal p-2 cursor-pointer"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? '[CLOSE]' : '[MENU]'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-fog bg-soot">
          <div className="px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block font-mono text-sm uppercase tracking-wider no-underline ${
                    isActive ? 'text-signal' : 'text-bone hover:text-glow'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex gap-2 pt-2 border-t border-fog">
              <button
                onClick={cycleEffects}
                className="font-mono text-xs px-2 py-1 border border-fog text-dust cursor-pointer"
                aria-label={`Visual effects: ${EFFECT_LABELS[effectLevel]}. Select to cycle.`}
              >
                FX:{EFFECT_LABELS[effectLevel]}
              </button>
              <button
                onClick={toggleHighContrast}
                className="font-mono text-xs px-2 py-1 border border-fog text-dust cursor-pointer"
                aria-label={`High contrast: ${highContrast ? 'on' : 'off'}`}
              >
                {highContrast ? 'HC:ON' : 'HC:OFF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
