import { type ReactNode } from 'react';

import { useGsapContext, useIsDesktop, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/cn';
import { gsap } from '@/lib/gsap';

export interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  /** Scrub smoothing in seconds. Higher = more lag, more "expensive" feel. */
  scrub?: number;
}

/**
 * Pinned horizontal scroll rail: the section sticks to the viewport while
 * vertical scrolling drives horizontal movement.
 *
 * Deliberate constraints, learned the hard way:
 *  - **Desktop only.** Pinning hijacks momentum scrolling on touch devices and
 *    fights the mobile URL bar. Small screens get native `scroll-snap`
 *    instead, which is smoother *and* less code.
 *  - **Reduced motion opts out entirely** and falls back to the same native
 *    horizontal scroll — the content stays fully reachable.
 *  - Distances are **functions**, not numbers, plus `invalidateOnRefresh`, so
 *    a resize or font load recalculates instead of leaving dead scroll space.
 */
export function HorizontalScroll({
  children,
  className,
  trackClassName,
  scrub = 1,
}: HorizontalScrollProps) {
  const isDesktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const enabled = isDesktop && !reduced;

  const root = useGsapContext<HTMLDivElement>(
    ({ scope }) => {
      if (!enabled) return;

      const track = scope.querySelector<HTMLElement>('[data-track]');
      if (!track) return;

      // Re-measured on every refresh rather than captured once.
      const distance = () => Math.max(0, track.scrollWidth - scope.clientWidth);
      if (distance() === 0) return;

      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: () => `+=${String(distance())}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub,
          invalidateOnRefresh: true,
        },
      });
    },
    [enabled, scrub],
  );

  return (
    <div
      ref={root}
      className={cn('relative', enabled && 'h-dvh overflow-hidden', className)}
      // Tell assistive tech and keyboard users this is a scrollable list.
      role="region"
      aria-label="Horizontally scrolling gallery"
    >
      <div
        data-track
        className={cn(
          'flex items-center gap-6',
          enabled
            ? 'h-full will-animate'
            : 'hide-scrollbar snap-x snap-mandatory overflow-x-auto px-6 pb-4',
          trackClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
