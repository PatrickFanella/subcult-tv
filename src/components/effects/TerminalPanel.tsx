interface TerminalPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  prompt?: string;
}

export default function TerminalPanel({
  title = 'terminal',
  children,
  className = '',
  prompt = '$ ',
}: TerminalPanelProps) {
  return (
    <div
      className={`bg-soot border border-fog overflow-hidden ${className}`}
      role="region"
      aria-label={`Terminal: ${title}`}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-smoke border-b border-fog">
        <span className="font-mono text-xs text-bone">{title}</span>
      </div>

      {/* Content */}
      <div className="p-4 font-mono text-sm text-static leading-relaxed">
        <span className="text-dust select-none">{prompt}</span>
        {children}
      </div>
    </div>
  );
}
