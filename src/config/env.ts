/**
 * The ONLY place `import.meta.env` is read.
 *
 * Every other module imports the parsed, typed `env` object. That keeps env
 * access DRY, makes malformed variables fail loudly at boot instead of
 * silently at runtime, and gives us one seam to stub in tests.
 */

/** Literal union of this app's own variables — see `src/vite-env.d.ts`. */
type EnvKey = keyof AppImportMetaEnv;

class EnvError extends Error {
  constructor(key: string, reason: string) {
    super(`[env] ${key}: ${reason}`);
    this.name = 'EnvError';
  }
}

/**
 * Vite's `ImportMetaEnv` carries an `any` index signature, so reading a key
 * directly launders `any` into the rest of the app. Narrowing it here — once —
 * is what lets every consumer below stay fully typed.
 */
function readRaw(key: EnvKey): string | undefined {
  const value: unknown = import.meta.env[key];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readString(key: EnvKey, fallback?: string): string {
  const value = readRaw(key);
  if (value !== undefined) return value;
  if (fallback !== undefined) return fallback;
  throw new EnvError(key, 'is required but was empty');
}

function readNumber(key: EnvKey, fallback: number): number {
  const value = readRaw(key);
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new EnvError(key, `expected a number, got "${value}"`);
  return parsed;
}

const TRUTHY = new Set(['1', 'true', 'yes', 'on']);
const FALSY = new Set(['0', 'false', 'no', 'off']);

function readBoolean(key: EnvKey, fallback: boolean): boolean {
  const value = readRaw(key)?.toLowerCase();
  if (value === undefined) return fallback;
  if (TRUTHY.has(value)) return true;
  if (FALSY.has(value)) return false;
  throw new EnvError(key, `expected a boolean, got "${value}"`);
}

export interface AppEnv {
  readonly appName: string;
  readonly apiBaseUrl: string;
  readonly apiTimeoutMs: number;
  readonly mode: string;
  readonly isDev: boolean;
  readonly isProd: boolean;
  readonly features: {
    readonly mockApi: boolean;
    readonly analytics: boolean;
  };
}

export const env: AppEnv = {
  appName: readString('VITE_APP_NAME', 'Tavheeda Bashir'),
  apiBaseUrl: readString('VITE_API_BASE_URL', '/api'),
  apiTimeoutMs: readNumber('VITE_API_TIMEOUT_MS', 12_000),
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  features: {
    mockApi: readBoolean('VITE_ENABLE_MOCK_API', true),
    analytics: readBoolean('VITE_ENABLE_ANALYTICS', false),
  },
};
