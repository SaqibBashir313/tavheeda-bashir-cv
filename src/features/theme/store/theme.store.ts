import { STORAGE_KEYS } from '@/config/constants';
import { createStore } from '@/store/createStore';

/** `system` is a first-class choice, not the absence of one. */
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'] as const;

interface ThemeState {
  /** What the user asked for. */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Cycles light → dark → system, for a single-button toggle. */
  cycleMode: () => void;
}

export const useThemeStore = createStore<ThemeState>(
  'theme',
  (set, get) => ({
    mode: 'system',
    setMode: (mode) => set({ mode }, false, `theme/setMode:${mode}`),
    cycleMode: () => {
      const index = THEME_MODES.indexOf(get().mode);
      const next = THEME_MODES[(index + 1) % THEME_MODES.length] ?? 'system';
      set({ mode: next }, false, `theme/cycleMode:${next}`);
    },
  }),
  {
    key: STORAGE_KEYS.theme,
    // Only `mode` is persisted. The resolved theme is always derived, so a
    // user who changes their OS preference is never stuck on a stale value.
    partialize: (state) => ({ mode: state.mode }),
    version: 1,
  },
);

export const selectThemeMode = (state: ThemeState) => state.mode;
