import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Optional name shown in the error UI (e.g. "Admin Dashboard") */
  name?: string;
  /** Render a minimal inline error instead of full-page fallback */
  inline?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log to console in dev — wire to Sentry/Datadog in production
    console.error(`[NovaMart ErrorBoundary] ${this.props.name || 'App'} crashed:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { name = 'This section', inline = false } = this.props;
    const isDev = import.meta.env.DEV;

    // ── Inline / compact fallback (for widgets, cards, etc.)
    if (inline) {
      return (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-rose-800 dark:text-rose-200">{name} failed to load</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5 truncate">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      );
    }

    // ── Full-page fallback
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          {/* Header stripe */}
          <div className="h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />

          <div className="p-8 space-y-5">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            </div>

            {/* Copy */}
            <div className="text-center space-y-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Something went wrong
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-700 dark:text-slate-300">{name}</strong> ran into an unexpected problem.
                Your data is safe — try refreshing or go back to the home page.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all active:scale-95"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Dev-only error details */}
            {isDev && this.state.error && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors w-full"
                >
                  {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {this.state.showDetails ? 'Hide' : 'Show'} error details (dev only)
                </button>
                {this.state.showDetails && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 text-slate-300 text-xs font-mono overflow-auto max-h-48 leading-relaxed">
                    <p className="text-rose-400 font-bold mb-1">{this.state.error.name}: {this.state.error.message}</p>
                    <pre className="whitespace-pre-wrap opacity-70">{this.state.errorInfo?.componentStack}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Convenience HOC — wraps any component with an ErrorBoundary automatically.
 * Usage: export default withErrorBoundary(MyComponent, 'My Component Name');
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  name?: string
) {
  return function WithBoundary(props: P) {
    return (
      <ErrorBoundary name={name}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
