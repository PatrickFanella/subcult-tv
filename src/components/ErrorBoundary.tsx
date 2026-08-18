import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8 bg-void">
        <div className="max-w-xl w-full bg-soot border-2 border-signal p-8 shadow-brutal text-center">
          <p className="font-mono text-signal text-sm mb-4">&gt; ERROR {this.state.error ? '500' : 'unknown'}</p>
          <h2 className="font-display uppercase text-chalk text-2xl mb-4">
            {this.props.fallbackTitle ?? 'SIGNAL DIED'}
          </h2>
          <p className="font-mono text-bone text-sm mb-6">
            The requested view crashed. Try reloading the page, then return to the home signal.
          </p>
          {this.state.error && (
            <pre className="bg-void border border-fog p-4 text-xs text-flicker font-mono mb-6 overflow-auto text-left whitespace-pre-wrap break-all">
              {String(this.state.error.message || this.state.error)}
            </pre>
          )}
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={this.handleReload}
              className="bg-signal text-void px-5 py-2.5 font-mono font-bold uppercase tracking-wider hover:bg-signal-dim cursor-pointer"
            >
              ↺ Retry
            </button>
            <a
              href="/"
              className="bg-transparent text-chalk border-2 border-chalk px-5 py-2.5 font-mono font-bold uppercase tracking-wider hover:bg-chalk hover:text-void"
            >
              ← Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}