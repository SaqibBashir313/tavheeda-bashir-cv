import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { DURATION, EASE } from '@/config/animation';

let registered = false;

/**
 * Registers GSAP plugins exactly once, and sets global defaults so individual
 * tweens don't have to repeat `ease`/`duration`.
 *
 * Called from `useGsapContext`, so any component that animates gets a
 * correctly configured GSAP without an explicit setup step — and plugins are
 * never registered twice under React Fast Refresh or StrictMode double-mount.
 */
export function registerGsapPlugins(): void {
  if (registered || typeof window === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  gsap.defaults({ ease: EASE.outSoft, duration: DURATION.md });

  ScrollTrigger.config({
    // Mobile browsers fire resize when the URL bar collapses; recalculating
    // then causes visible jumps in pinned sections.
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  });

  registered = true;
}

export { gsap, ScrollToPlugin, ScrollTrigger };
