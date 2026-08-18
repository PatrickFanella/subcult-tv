import type { CoverPattern } from '@/types';

interface CoverArtProps {
  color: string;
  pattern: CoverPattern;
  name: string;
  className?: string;
}

function patternSVG(pattern: CoverArtProps['pattern'], color: string): string {
  const rgb = hexToRgb(color);
  const rgba = (a: number) => `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;

  switch (pattern) {
    case 'circuit':
      return `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v20M0 30h20M40 30h20M30 40v20M15 15l10 10M35 15l-10 10M15 45l10-10M35 45l-10-10' stroke='${encodeURIComponent(rgba(0.3))}' fill='none' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='3' fill='${encodeURIComponent(rgba(0.5))}'/%3E%3C/svg%3E")`;
    case 'grid':
      return `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='${encodeURIComponent(rgba(0.15))}' stroke-width='1'/%3E%3C/svg%3E")`;
    case 'waves':
      return `url("data:image/svg+xml,%3Csvg width='80' height='20' viewBox='0 0 80 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10c10 0 10-8 20-8s10 8 20 8 10-8 20-8 10 8 20 8' fill='none' stroke='${encodeURIComponent(rgba(0.2))}' stroke-width='1.5'/%3E%3C/svg%3E")`;
    case 'dots':
      return `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='1.5' fill='${encodeURIComponent(rgba(0.3))}'/%3E%3C/svg%3E")`;
    case 'sigil':
      return `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='${encodeURIComponent(rgba(0.15))}' stroke-width='1'/%3E%3Cpath d='M40 20v40M20 40h40M28 28l24 24M52 28l-24 24' stroke='${encodeURIComponent(rgba(0.1))}' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`;
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 139, g: 91, b: 246 };
}

export default function CoverArt({ color, pattern, name, className = '' }: CoverArtProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 50%, ${color}20 100%)`,
        backgroundImage: patternSVG(pattern, color),
      }}
      aria-hidden="true"
    >
      {/* Diagonal stripe accent */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, transparent 40%, ${color}10 40%, ${color}10 42%, transparent 42%)`,
        }}
      />
      {/* Project initial glyph */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-6xl font-bold opacity-10 select-none" style={{ color }}>
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
