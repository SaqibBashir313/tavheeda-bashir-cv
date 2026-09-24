import { useCallback, useMemo } from 'react';

import { MEDIA_QUERIES } from '@/config/constants';
import {
  type ResolvedTheme,
  type ThemeMode,
  useThemeStore,
} from '@/features/theme/store/theme.store';
import { useMediaQuery } from '@/hooks';

export interface ThemeApi {
  /** The user's choice: light, dark, or follow the system. */
  mode: ThemeMode;
  /** What is actually on screen right now. */
  resolved: ResolvedTheme;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
  toggle: () => void;
}

/**
 * The only theme API components should touch.
 *
 * `resolved` is derived, never stored: it combines the persisted `mode` with a
 * live `prefers-color-scheme` subscription, so a user on `system` follows
 * their OS in real time.
 */
export function useTheme(): ThemeApi {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const cycleMode = useThemeStore((state) => state.cycleMode);
  const systemPrefersDark = useMediaQuery(MEDIA_QUERIES.dark);

  const resolved: ResolvedTheme = mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode;

  // A two-state toggle for keyboard/ARIA switches: flips away from whatever
  // is currently rendered, which is what a user expects from one button.
  const toggle = useCallback(() => {
    setMode(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setMode]);

  return useMemo(
    () => ({ mode, resolved, isDark: resolved === 'dark', setMode, cycleMode, toggle }),
    [mode, resolved, setMode, cycleMode, toggle],
  );
}
