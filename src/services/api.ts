import { env } from '@/config/env';
import { HttpClient } from '@/services/http/client';
import { HttpError } from '@/services/http/errors';

/**
 * The configured, app-wide API client.
 *
 * Cross-cutting concerns are registered once, here — features never repeat
 * them. Add auth, tracing or logging by pushing an interceptor, not by
 * editing call sites.
 */
export const api = new HttpClient({
  baseUrl: env.apiBaseUrl,
  timeoutMs: env.apiTimeoutMs,
  defaultHeaders: {
    Accept: 'application/json',
    'X-Client': 'web',
  },
});

/** Example: attach a request id so client and server logs can be correlated. */
api.interceptors.onRequest.push((context) => {
  const headers = new Headers(context.init.headers);
  headers.set('X-Request-Id', crypto.randomUUID());
  return { ...context, init: { ...context.init, headers } };
});

/** Example: one place to react to session expiry. */
api.interceptors.onError.push((error) => {
  if (error instanceof HttpError && error.isUnauthorized) {
    // e.g. authStore.getState().signOut()
    if (env.isDev) console.warn('[api] unauthorized', error.url);
  }
});

/**
 * Endpoint paths as data. Typos become type errors, and a backend rename is
 * a one-line change instead of a grep-and-pray.
 */
export const ENDPOINTS = {
  projects: {
    list: '/projects',
    detail: (slug: string) => `/projects/${slug}`,
  },
  contact: {
    submit: '/contact',
  },
} as const;
