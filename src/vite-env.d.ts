/// <reference types="vite/client" />

/**
 * The app's own environment variables, declared separately from
 * `ImportMetaEnv`.
 *
 * Why the extra interface: Vite's `ImportMetaEnv` carries an
 * `[key: string]: any` index signature, so `keyof ImportMetaEnv` widens to
 * `string | number` and stops being useful. Keying off `AppImportMetaEnv`
 * instead gives `src/config/env.ts` a real literal union — a typo in a
 * variable name becomes a compile error.
 */
interface AppImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TIMEOUT_MS?: string;
  readonly VITE_ENABLE_MOCK_API?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
}

/* eslint-disable-next-line @typescript-eslint/no-empty-object-type --
   Declaration merging: the body is intentionally empty; the members are
   declared above and merged into Vite's own `ImportMetaEnv`. */
interface ImportMetaEnv extends AppImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
