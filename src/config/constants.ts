/** Storage keys. Namespaced so multiple apps can share an origin safely. */
export const STORAGE_KEYS = {
  /** Keep in sync with the theme bootstrap script in `index.html`. */
  theme: 'tb-theme',
  reducedMotionOverride: 'tb-reduced-motion',
} as const;

/** Breakpoints mirrored from Tailwind so JS and CSS never disagree. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const MEDIA_QUERIES = {
  reducedMotion: '(prefers-reduced-motion: reduce)',
  dark: '(prefers-color-scheme: dark)',
  hover: '(hover: hover) and (pointer: fine)',
  belowLg: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  lgUp: `(min-width: ${BREAKPOINTS.lg}px)`,
} as const;

export const TOAST_DEFAULTS = {
  /** Max toasts on screen; older ones are evicted to avoid a wall of cards. */
  limit: 4,
  duration: 5_000,
  durationByVariant: {
    success: 4_000,
    info: 5_000,
    warning: 7_000,
    /** Errors stay until dismissed — they usually need an action. */
    error: 0,
  },
} as const;
