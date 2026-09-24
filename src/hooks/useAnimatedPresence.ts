import {
  type RefObject,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { gsap, registerGsapPlugins } from '@/lib/gsap';

import { usePrefersReducedMotion } from './useMediaQuery';

type Animation = gsap.core.Tween | gsap.core.Timeline | void;

export interface AnimatedPresenceOptions<T extends HTMLElement> {
  /** The *intent*. Rendering is controlled by the returned `mounted`. */
  open: boolean;
  enter: (element: T) => Animation;
  /** Must call `done()` (usually via `onComplete`) to release the element. */
  exit: (element: T, done: () => void) => Animation;
}

export interface AnimatedPresence<T extends HTMLElement> {
  /** Render the element while this is true — it stays true during exit. */
  mounted: boolean;
  ref: RefObject<T | null>;
}

/**
 * Exit animations in React are awkward: the component is gone before you can
 * animate it. This hook decouples *intent* (`open`) from *presence*
 * (`mounted`): on close it keeps the node alive, runs the exit animation, and
 * only then unmounts.
 *
 * Shared by `<Tooltip />`, `<Modal />`, `<MobileNav />` and `<ToastItem />` —
 * one implementation of enter/exit choreography for every transient surface.
 *
 * `mounted` is *derived* (`open || isExiting`) rather than set from an effect,
 * so opening is immediate: no extra render, no frame where the element is
 * mounted but un-styled.
 *
 * Reduced motion is handled by fast-forwarding the animation to its end
 * (`progress(1)`), which still fires `onComplete` — so the state machine is
 * identical either way, with zero special-casing in consumers.
 */
export function useAnimatedPresence<T extends HTMLElement = HTMLDivElement>(
  options: AnimatedPresenceOptions<T>,
): AnimatedPresence<T> {
  const { open } = options;
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  /** The enter/exit animation currently in flight, so it can be killed whole. */
  const activeRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);

  const [previousOpen, setPreviousOpen] = useState(open);
  const [isExiting, setIsExiting] = useState(false);

  // React's documented "adjust state when a prop changes" pattern: guarded
  // setState during render, which React applies before committing — cheaper
  // and flicker-free compared with doing this in an effect.
  if (previousOpen !== open) {
    setPreviousOpen(open);
    setIsExiting(!open);
  }

  const mounted = open || isExiting;

  const runEnter = useEffectEvent((element: T) => options.enter(element));
  const runExit = useEffectEvent((element: T, done: () => void) => options.exit(element, done));

  useLayoutEffect(() => {
    const element = ref.current;
    if (!mounted || !element) return;

    registerGsapPlugins();

    /*
     * Kill the animation we created, not "tweens of this element".
     *
     * `gsap.killTweensOf(element)` only reaches tweens whose target is that one
     * element — but `enter`/`exit` return *timelines* that often animate more
     * than one node (`<Modal>` and `<MobileNav>` also tween the overlay). On a
     * fast close → reopen, the panel's exit tween died while the overlay's kept
     * running, outlived the enter timeline, and won the final write: the modal
     * sat open over a fully transparent backdrop.
     *
     * Killing the timeline handle takes every child tween with it. The failure
     * was reproduced directly against GSAP (a surviving sibling tween outlives
     * the replacement timeline and wins the final write); it did not reproduce
     * at the timings the browser smoke test drives, so treat this as
     * defence-in-depth rather than a fix for an observed visual bug.
     */
    activeRef.current?.kill();
    // Belt and braces for anything that tweened this element from outside.
    gsap.killTweensOf(element);

    if (open) {
      const animation = runEnter(element);
      activeRef.current = animation ?? null;
      if (reduced) animation?.progress(1);
      return;
    }

    const animation = runExit(element, () => setIsExiting(false));
    activeRef.current = animation ?? null;
    if (reduced) animation?.progress(1);
  }, [open, mounted, reduced]);

  // An animation still running at unmount would keep ticking against a
  // detached node.
  useEffect(
    () => () => {
      activeRef.current?.kill();
      activeRef.current = null;
    },
    [],
  );

  return { mounted, ref };
}
