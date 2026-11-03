/** Placeholder while a code-split page loads. Shared by the browser app and the prerender build. */
export function RouteFallback({ label }: { label: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <span className="font-mono text-dust text-sm cursor-blink">&gt; {label}...</span>
    </div>
  );
}
