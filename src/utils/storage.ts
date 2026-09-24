/**
 * localStorage that cannot throw.
 *
 * Safari private mode, disabled cookies and quota errors all throw on plain
 * `localStorage` access. Wrapping it once here means no feature has to
 * remember a try/catch.
 */

function available(): boolean {
  try {
    const probe = '__tb_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const isAvailable = typeof window !== 'undefined' && available();

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (!isAvailable) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    if (!isAvailable) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded — persistence is best-effort, never load-bearing */
    }
  },

  remove(key: string): void {
    if (!isAvailable) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
