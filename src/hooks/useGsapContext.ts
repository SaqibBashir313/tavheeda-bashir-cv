import {
  type DependencyList,
  type RefObject,
  useEffectEvent,
  useLayoutEffect,
  useRef,
} from 'react';

import { gsap, registerGsapPlugins } from '@/lib/gsap';

import { usePrefersReducedMotion } from './useMediaQuery';

export interface GsapScopeApi<T extends Element> {
  /** The GSAP context. Anything created inside is auto-reverted on cleanup. */
  self: gsap.Context;
  /** The scoped root element — selector strings resolve inside it. */
  scope: T;
  /** True when the user prefers reduced motion. Honour it. */
  reduced: boolean;
}

export type GsapSetup<T extends Element> = (api: GsapScopeApi<T>) => void | (() => void);

/**
 * The single animation primitive of this codebase.
 *
 * Responsibilities (so that no component has to repeat them):
 *  1. Registers GSAP plugins on first use.
 *  2. Runs setup in a **layout effect** — `from` state applied before paint,
 *     so there is no frame of un-animated content.
 *  3. Scopes selector strings to the returned ref, so `'.card'` inside two
 *     instances of the same component never cross-animate.
 *  4. Reverts every tween, timeline and ScrollTrigger created inside on
 *     unmount / dependency change — no leaks, StrictMode-safe, HMR-safe.
 *  5. Surfaces `reduced` so each animation can degrade gracefully, and
 *     re-runs setup when that preference changes.
 *
 * `setup` may return a cleanup function (GSAP contexts support this), which is
 * how `<AnimatedText />` reverts its split DOM.
 *
 * @example
 * const root = useGsapContext<HTMLDivElement>(({ scope, reduced }) => {
 *   playPreset({ targets: scope.querySelectorAll('[data-item]'), preset: 'fade-up', reduced });
 * });
 * return <div ref={root}>…</div>;
 */
export function useGsapContext<T extends Element = HTMLDivElement>(
  setup: GsapSetup<T>,
  deps: DependencyList = [],
): RefObject<T | null> {
  const scopeRef = useRef<T>(null);
  const reduced = usePrefersReducedMotion();

  // `setup` is a fresh closure every render, but the animation should only be
  // rebuilt when `deps` (or the motion preference) change. An Effect Event is
  // stable *and* always sees the latest props — exactly the contract we want.
  const runSetup = useEffectEvent((api: GsapScopeApi<T>) => setup(api));

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    registerGsapPlugins();

    // Returning the caller's cleanup lets GSAP run it as part of `revert()`.
    const ctx = gsap.context((self) => runSetup({ self, scope, reduced }), scope);

    return () => {
      ctx.revert();
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps --
       `deps` is the caller's contract, passed through by design; `setup` is
       read through an Effect Event and must not be a dependency. */
  }, [reduced, ...deps]);

  return scopeRef;
}
