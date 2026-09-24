import { type RefObject, useEffect, useEffectEvent } from 'react';

/**
 * Adds an event listener with an always-fresh handler.
 *
 * `useEffectEvent` gives us a stable function identity that still closes over
 * the latest render's props and state. Without it, consumers would have to
 * `useCallback` every handler or the listener would be torn down and re-added
 * on every render.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions,
): void;
export function useEventListener<K extends keyof HTMLElementEventMap>(
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options: AddEventListenerOptions | undefined,
  target: RefObject<HTMLElement | null>,
): void;
export function useEventListener(
  type: string,
  handler: (event: Event) => void,
  options?: AddEventListenerOptions,
  target?: RefObject<HTMLElement | null>,
): void {
  const onEvent = useEffectEvent((event: Event) => {
    handler(event);
  });

  useEffect(() => {
    const element: Window | HTMLElement | null = target ? target.current : window;
    if (!element) return;

    element.addEventListener(type, onEvent, options);
    return () => element.removeEventListener(type, onEvent, options);
  }, [type, options, target]);
}
