import { type ReactNode, useEffect } from 'react';

import { useTheme } from '@/features/theme/hooks/useTheme';
import { usePrefersReducedMotion } from '@/hooks';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Applies the resolved theme to `<html>`.
 *
 * There is no React context here on purpose: the theme lives in a Zustand
 * store, so any component can read it without a provider, and this component
 * exists solely to own the DOM side effect. One writer, no fighting.
 *
 * The first paint is already correct thanks to the inline bootstrap script in
 * `index.html`; this keeps it in sync afterwards.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { resolved } = useTheme();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    // Native widgets (scrollbars, form controls, caret) follow `color-scheme`.
    root.style.colorScheme = resolved;
  }, [resolved]);

  useEffect(() => {
    // Cross-fade the whole document on theme change — but only once the app
    // has mounted, and never for users who asked for reduced motion.
    const root = document.documentElement;
    if (reducedMotion) {
      root.style.removeProperty('transition');
      return;
    }
    root.style.transition =
      'background-color 260ms var(--ease-out-soft), color 260ms var(--ease-out-soft)';
  }, [reducedMotion]);

  return children;
}
