import { type ReactNode } from 'react';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ToastViewport } from '@/features/notifications';
import { ThemeProvider } from '@/features/theme';

/**
 * Composition root for app-wide concerns.
 *
 * Deliberately shallow: state lives in Zustand stores, which need no
 * providers, so this tree holds only things that genuinely must wrap the app —
 * an outer error boundary, the theme DOM effect, the shared tooltip delay, and
 * the single toast viewport.
 *
 * Adding a provider here is a decision, not a habit. Every layer costs a
 * re-render boundary and a step of indirection when debugging.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          {children}
          <ToastViewport />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
