import { clamp } from '@/utils/misc';

import { HttpError, isRetryableError, NetworkError, TimeoutError } from './errors';

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  /** Serialised into the query string; `null`/`undefined` entries are dropped. */
  query?: QueryParams;
  /** Any JSON-serialisable value, or a `FormData`/`Blob` passed through as-is. */
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
}

export interface HttpClientConfig {
  baseUrl: string;
  timeoutMs: number;
  defaultHeaders?: Record<string, string>;
  /** Retry attempts for idempotent requests. Default 2. */
  retries?: number;
}

export interface RequestContext {
  url: string;
  method: string;
  init: RequestInit;
}

export interface Interceptors {
  onRequest: ((context: RequestContext) => RequestContext | Promise<RequestContext>)[];
  onResponse: ((response: Response) => Response | Promise<Response>)[];
  onError: ((error: unknown) => void)[];
}

const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function buildQueryString(query: QueryParams | undefined): string {
  if (!query) return '';
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      value
        .filter((item): item is Exclude<QueryValue, null | undefined> => item != null)
        .forEach((item) => params.append(key, String(item)));
      continue;
    }
    params.append(key, String(value));
  }

  const serialised = params.toString();
  return serialised ? `?${serialised}` : '';
}

function isPassthroughBody(body: unknown): body is BodyInit {
  return (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    typeof body === 'string'
  );
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.headers.get('content-length') === '0') return null;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as unknown;
  }
  return response.text();
}

function backoffDelay(attempt: number): number {
  // Exponential with jitter, so a thundering herd doesn't retry in lockstep.
  const base = 2 ** attempt * 250;
  return clamp(base + Math.random() * 200, 250, 4_000);
}

/**
 * The single HTTP boundary of the application.
 *
 * Every feature's `*.api.ts` calls this client; nothing calls `fetch` directly.
 * That gives us exactly one place to add auth headers, tracing, retries,
 * timeouts and error normalisation — the definition of a DRY service layer.
 */
export class HttpClient {
  private readonly config: Required<HttpClientConfig>;
  readonly interceptors: Interceptors = { onRequest: [], onResponse: [], onError: [] };

  constructor(config: HttpClientConfig) {
    this.config = {
      retries: 2,
      defaultHeaders: { Accept: 'application/json' },
      ...config,
    };
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, { ...options, body });
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, { ...options, body });
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }

  private resolveUrl(path: string, query: QueryParams | undefined): string {
    const base = this.config.baseUrl.replace(/\/+$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}${buildQueryString(query)}`;
  }

  private async request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const { query, body, timeoutMs, retries, headers, signal, ...rest } = options;

    const url = this.resolveUrl(path, query);
    const maxAttempts = (retries ?? (IDEMPOTENT_METHODS.has(method) ? this.config.retries : 0)) + 1;

    const requestHeaders = new Headers({ ...this.config.defaultHeaders, ...headers });
    let requestBody: BodyInit | undefined;

    if (body !== undefined) {
      if (isPassthroughBody(body)) {
        requestBody = body;
      } else {
        requestBody = JSON.stringify(body);
        if (!requestHeaders.has('Content-Type')) {
          requestHeaders.set('Content-Type', 'application/json');
        }
      }
    }

    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const effectiveTimeout = timeoutMs ?? this.config.timeoutMs;
      // Compose the caller's signal with our timeout: whichever fires first wins.
      const timeoutSignal = AbortSignal.timeout(effectiveTimeout);
      const composedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

      let context: RequestContext = {
        url,
        method,
        init: {
          ...rest,
          method,
          headers: requestHeaders,
          body: requestBody,
          signal: composedSignal,
        },
      };

      try {
        for (const onRequest of this.interceptors.onRequest) {
          context = await onRequest(context);
        }

        let response = await fetch(context.url, context.init);
        for (const onResponse of this.interceptors.onResponse) {
          response = await onResponse(response);
        }

        if (!response.ok) {
          throw new HttpError(
            response.status,
            response.statusText,
            context.url,
            await parseBody(response).catch(() => null),
          );
        }

        return (await parseBody(response)) as T;
      } catch (cause) {
        lastError = this.normalizeError(
          cause,
          context.url,
          timeoutMs ?? this.config.timeoutMs,
          signal,
        );

        const canRetry = attempt < maxAttempts - 1 && isRetryableError(lastError);
        if (!canRetry) break;

        await new Promise((resolve) => setTimeout(resolve, backoffDelay(attempt)));
      }
    }

    this.interceptors.onError.forEach((onError) => onError(lastError));
    throw lastError;
  }

  private normalizeError(
    cause: unknown,
    url: string,
    timeoutMs: number,
    callerSignal: AbortSignal | null | undefined,
  ): unknown {
    if (cause instanceof HttpError) return cause;

    if (
      cause instanceof DOMException &&
      (cause.name === 'AbortError' || cause.name === 'TimeoutError')
    ) {
      // The caller aborted (unmount, new request) — propagate as-is so
      // `useAsync` can swallow it instead of showing an error state.
      if (callerSignal?.aborted) return cause;
      return new TimeoutError(url, timeoutMs);
    }

    if (cause instanceof TypeError) return new NetworkError(url, cause);
    return cause;
  }
}
