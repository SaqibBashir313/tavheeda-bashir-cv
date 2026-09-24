import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { env } from '@/config/env';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Rendered instead of the crashed subtree. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Hook for your error reporter (Sentry, etc.). */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Error boundaries are the one thing React still requires a class for.
 *
 * Placed around each route (not just the app root) so a single broken page
 * degrades to a recoverable panel instead of a white screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
    if (env.isDev) console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private readonly reset = () => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        role="alert"
        className="mx-auto flex max-w-md flex-col items-start gap-4 rounded-2xl border border-line bg-surface-raised p-8"
      >
        <h2 className="text-lg font-semibold">Something broke on this page</h2>
        <p className="text-sm text-content-secondary">
          {env.isDev ? error.message : 'An unexpected error occurred. Please try again.'}
        </p>
        <Button variant="secondary" size="sm" onClick={this.reset}>
          Try again
        </Button>
      </div>
    );
  }
}
