import { useCallback, useSyncExternalStore } from 'react';

import { MEDIA_QUERIES } from '@/config/constants';

/**
 * Media queries via `useSyncExternalStore` rather than `useState` + effect:
 * the value is read during render, so there is no first-frame flicker with
 * the wrong value, and React handles tearing for us.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onStoreChange);
      return () => list.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  // Server snapshot: assume "no match" — the conservative default.
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/**
 * The accessibility switch for the entire motion layer. Every animation hook
 * consults this; nothing animates when the OS asks us not to.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(MEDIA_QUERIES.reducedMotion);
}

/** True on devices with a real pointer — gate hover-only affordances on it. */
export function useHasHover(): boolean {
  return useMediaQuery(MEDIA_QUERIES.hover);
}

export function useIsDesktop(): boolean {
  return useMediaQuery(MEDIA_QUERIES.lgUp);
}
