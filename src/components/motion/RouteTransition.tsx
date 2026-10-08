import { useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useOutlet } from 'react-router';

import { PAGE_TRANSITION } from '@/config/animation';
import { usePrefersReducedMotion } from '@/hooks';
import { gsap, registerGsapPlugins, ScrollTrigger } from '@/lib/gsap';

interface Displayed {
  node: ReturnType<typeof useOutlet>;
  key: string;
}

/**
 * Animated page transitions for React Router.
 *
 * React unmounts the old route before you can animate it, so this component
 * keeps the outgoing element in state, plays the exit tween, and only then
 * swaps in the new one. Exit is deliberately short (~200ms) — it is dead time
 * the user did not ask for.
 *
 * It also owns the two things every route change needs and everybody forgets:
 *   - reset scroll position *before* the enter animation, not after;
 *   - `ScrollTrigger.refresh()` once the new page has laid out, otherwise
 *     every scroll-driven animation on it measures the previous page's height.
 */
export function RouteTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduced = usePrefersReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const [displayed, setDisplayed] = useState<Displayed>({ node: outlet, key: location.pathname });

  /**
   * Swaps in whatever the router is currently rendering.
   *
   * An Effect Event, because `outlet` gets a new identity on every render:
   * tracking it as a dependency would restart the exit tween constantly,
   * while omitting it from a plain effect would capture a stale element.
   */
  const showLatestRoute = useEffectEvent(() => {
    setDisplayed({ node: outlet, key: location.pathname });
  });

  // Exit: pathname changed, but we are still showing the previous route.
  useLayoutEffect(() => {
    if (location.pathname === displayed.key) return;

    const container = containerRef.current;
    if (!container) {
      showLatestRoute();
      return;
    }

    registerGsapPlugins();
    const tween = gsap.to(container, {
      autoAlpha: 0,
      y: -10,
      duration: PAGE_TRANSITION.exitDuration,
      ease: PAGE_TRANSITION.exitEase,
      overwrite: 'auto',
      onComplete: showLatestRoute,
    });
    if (reduced) tween.progress(1);

    return () => {
      tween.kill();
    };
  }, [location.pathname, displayed.key, reduced]);

  // Enter: a new route is now mounted.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    registerGsapPlugins();
    const tween = gsap.fromTo(
      container,
      { autoAlpha: 0, y: 12 },
      {
        autoAlpha: 1,
        y: 0,
        duration: PAGE_TRANSITION.enterDuration,
        ease: PAGE_TRANSITION.enterEase,
        clearProps: 'transform',
        overwrite: 'auto',
        // Measure after the browser has laid the new page out.
        onComplete: () => ScrollTrigger.refresh(),
      },
    );
    if (reduced) tween.progress(1);

    return () => {
      tween.kill();
    };
  }, [displayed.key, reduced]);

  // No `will-animate`: that utility's permanent `transform` would give this
  // page-wrapping div a CSS containing block, which hijacks any descendant
  // using `position: fixed` — including GSAP ScrollTrigger's pinned sections
  // (e.g. the Experience page's horizontal rail), pulling them off-screen as
  // the page scrolls instead of leaving them fixed to the viewport.
  return (
    <div ref={containerRef}>
      {displayed.node}
    </div>
  );
}
