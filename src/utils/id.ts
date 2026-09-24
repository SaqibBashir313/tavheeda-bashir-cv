let counter = 0;

/**
 * Collision-free client id (toast keys, `aria-describedby` targets, …).
 * Prefers `crypto.randomUUID`, falls back to a monotonic counter on older
 * browsers and non-secure contexts, where `randomUUID` is unavailable.
 */
export function createId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  counter += 1;
  return `${prefix}-${String(counter)}-${Math.random().toString(36).slice(2, 8)}`;
}
