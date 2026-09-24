import { create, type StateCreator, type StoreApi, type UseBoundStore } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { env } from '@/config/env';

/**
 * Store initialiser type used across the app. The `devtools` mutator in the
 * signature is what lets actions name themselves:
 * `set({ open: true }, false, 'ui/open')` — those labels show up in the
 * Redux DevTools timeline, which is most of the debugging value.
 */
export type AppStateCreator<T> = StateCreator<T, [['zustand/devtools', never]], []>;

export interface StorePersistOptions<T> {
  /** localStorage key. Use a value from `STORAGE_KEYS`. */
  key: string;
  /** Persist only what matters — never persist derived or transient state. */
  partialize?: (state: T) => Partial<T>;
  /** Bump when the persisted shape changes, and handle it in `migrate`. */
  version?: number;
  migrate?: (persisted: unknown, version: number) => T;
}

/**
 * Store factory: every store in the app is created through this function.
 *
 * It wires up devtools (dev only) and `persist` (opt-in) once, so individual
 * stores contain nothing but their own state and actions. Adding logging or
 * an immer layer later is a change to this file alone.
 *
 * `persist` defaults to `localStorage` + JSON, which is exactly what we want;
 * the envelope it writes (`{ state, version }`) is the shape the theme
 * bootstrap script in `index.html` reads.
 */
export function createStore<T>(
  name: string,
  initializer: AppStateCreator<T>,
  persistOptions?: StorePersistOptions<T>,
): UseBoundStore<StoreApi<T>> {
  // The casts below are the price of composing Zustand middleware behind a
  // generic factory. They are contained here instead of in every store.
  const plain = initializer as unknown as StateCreator<T, [], []>;

  const base = persistOptions
    ? (persist(plain, {
        name: persistOptions.key,
        version: persistOptions.version ?? 0,
        ...(persistOptions.partialize ? { partialize: persistOptions.partialize } : {}),
        ...(persistOptions.migrate ? { migrate: persistOptions.migrate } : {}),
      }) as unknown as StateCreator<T, [], []>)
    : plain;

  const withDevtools = devtools(base, {
    name: `${env.appName} / ${name}`,
    enabled: env.isDev,
  }) as unknown as StateCreator<T, [], []>;

  return create<T>()(withDevtools);
}
