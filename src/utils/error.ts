/**
 * `catch (e)` gives you `unknown`. These helpers are the only sanctioned way
 * to turn that into something displayable, so error handling looks the same
 * in every feature.
 */

export function toError(cause: unknown): Error {
  if (cause instanceof Error) return cause;
  if (typeof cause === 'string') return new Error(cause);
  return new Error('An unexpected error occurred', { cause });
}

export function isAbortError(cause: unknown): boolean {
  return cause instanceof DOMException && cause.name === 'AbortError';
}

/** A message safe to show a user — never a stack trace, never `[object Object]`. */
export function getErrorMessage(cause: unknown, fallback = 'Something went wrong.'): string {
  const error = toError(cause);
  return error.message.trim() || fallback;
}
