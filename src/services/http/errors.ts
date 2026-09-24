/** Error taxonomy for the API layer. UI branches on the class, not on strings. */

export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly payload: unknown;

  constructor(status: number, statusText: string, url: string, payload: unknown) {
    super(`HTTP ${String(status)} ${statusText} — ${url}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.payload = payload;
  }

  /** 4xx: the request was wrong. Retrying will not help. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** 5xx: the server was wrong. Retrying might help. */
  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

export class NetworkError extends Error {
  readonly url: string;

  constructor(url: string, cause?: unknown) {
    super(`Network request to ${url} failed. Check your connection.`, { cause });
    this.name = 'NetworkError';
    this.url = url;
  }
}

export class TimeoutError extends Error {
  readonly url: string;
  readonly timeoutMs: number;

  constructor(url: string, timeoutMs: number) {
    super(`Request to ${url} timed out after ${String(timeoutMs)}ms.`);
    this.name = 'TimeoutError';
    this.url = url;
    this.timeoutMs = timeoutMs;
  }
}

/** Only these are worth retrying — everything else is a caller bug. */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError || error instanceof TimeoutError) return true;
  if (error instanceof HttpError) {
    return error.isServerError || error.status === 429 || error.status === 408;
  }
  return false;
}
