import { useEffects } from '@/context/useEffects';
import { useHydrated } from '@/lib/use-hydrated';

interface GlitchFrameProps {
  children: React.ReactNode;
  className?: string;
  enableScanlines?: boolean;
  enableNoise?: boolean;
  enableTracking?: boolean;
}

export default function GlitchFrame({
  children,
  className = '',
  enableScanlines = true,
  enableNoise = true,
  enableTracking = false,
}: GlitchFrameProps) {
  const { effectLevel } = useEffects();
  // The static HTML is rendered without effects; the visitor's saved VHS
  // setting applies once React owns the DOM.
  const hydrated = useHydrated();

  if (!hydrated || effectLevel === 'clean') {
    return <div className={className}>{children}</div>;
  }

  const classes = [
    className,
    enableScanlines ? 'scanlines' : '',
    enableNoise ? 'noise-overlay' : '',
    enableTracking && effectLevel === 'full' ? 'vhs-tracking' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
