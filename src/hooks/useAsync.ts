import {
  type DependencyList,
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { toError } from '@/utils/error';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface UseAsyncResult<T> extends AsyncState<T> {
  /** Re-runs the task, aborting any in-flight request first. */
  run: () => Promise<T | null>;
  reset: () => void;
}

export interface UseAsyncOptions {
  /** Run on mount / when `deps` change. Default: true. */
  immediate?: boolean;
  deps?: DependencyList;
}

const INITIAL: AsyncState<never> = {
  status: 'idle',
  data: null,
  error: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
};

/**
 * One async-state machine for the whole app, so no feature hand-rolls
 * `loading`/`error`/`data` triplets (and forgets one of them).
 *
 * Guarantees:
 *  - the task receives an `AbortSignal`, wired to unmount and to re-runs;
 *  - a stale response can never overwrite a newer one (request-id guard);
 *  - an aborted request is swallowed rather than surfaced as a user error.
 *
 * Scope note: this is deliberately a small, dependency-free hook. It is also
 * the single seam to replace if this app ever needs caching, dedup or
 * background refetch — swap the body for TanStack Query and every feature
 * hook (`useProjects`, …) keeps working unchanged.
 */
export function useAsync<T>(
  task: (signal: AbortSignal) => Promise<T>,
  options: UseAsyncOptions = {},
): UseAsyncResult<T> {
  const { immediate = true, deps = [] } = options;

  const [state, setState] = useState<AsyncState<T>>(INITIAL);

  const taskRef = useRef(task);
  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  // Declared first so the latest task is in place before any effect below
  // can call `run`. (Assigning refs in an effect, never during render.)
  useLayoutEffect(() => {
    taskRef.current = task;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const run = useCallback(async (): Promise<T | null> => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++requestIdRef.current;

    setState((previous) => ({
      ...previous,
      status: 'loading',
      error: null,
      isLoading: true,
      isError: false,
      isSuccess: false,
    }));

    try {
      const data = await taskRef.current(controller.signal);
      if (!mountedRef.current || requestId !== requestIdRef.current) return null;
      setState({
        status: 'success',
        data,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true,
      });
      return data;
    } catch (cause) {
      if (controller.signal.aborted || !mountedRef.current) return null;
      if (requestId !== requestIdRef.current) return null;
      setState({
        status: 'error',
        data: null,
        error: toError(cause),
        isLoading: false,
        isError: true,
        isSuccess: false,
      });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    requestIdRef.current += 1;
    setState(INITIAL);
  }, []);

  // Non-reactive by design: the fetch is an imperative action triggered by
  // `deps` changing, not a value derived from them.
  const autoRun = useEffectEvent(() => {
    void run();
  });

  useEffect(() => {
    if (!immediate) return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect --
       Kicking off a request on mount is, unavoidably, "set state from an
       effect": the `loading` flag has to land synchronously or the UI shows a
       frame of `idle`. React's own guidance for this case is to use a data
       library, and this hook is precisely the seam where that swap happens. */
    autoRun();
    /* eslint-disable-next-line react-hooks/exhaustive-deps --
       `deps` is the caller's cache key; it cannot be statically verified. */
  }, [immediate, ...deps]);

  return useMemo(() => ({ ...state, run, reset }), [state, run, reset]);
}
