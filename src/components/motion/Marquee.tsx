import { Fragment, type ReactNode } from 'react';

import { useGsapContext, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/cn';
import { gsap } from '@/lib/gsap';

export interface MarqueeProps<T> {
  items: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey: (item: T) => string;
  className?: string;
  trackClassName?: string;
  /** Seconds for one item's width to pass — lower is faster. */
  secondsPerItem?: number;
}

/**
 * Infinite horizontal marquee: the track is duplicated once and driven on a
 * continuous, time-based loop (`xPercent: -50`, `repeat: -1`) — independent
 * of scroll position, unlike `<HorizontalScroll>`. Pauses on hover/focus so a
 * visitor can actually read a card, and skips the loop entirely under
 * reduced motion, falling back to a native scrollable row instead — same
 * contract as the rest of this app's motion.
 */
export function Marquee<T>({
  items,
  renderItem,
  getKey,
  className,
  trackClassName,
  secondsPerItem = 4,
}: MarqueeProps<T>) {
  const reduced = usePrefersReducedMotion();

  const root = useGsapContext<HTMLDivElement>(
    ({ scope, reduced }) => {
      if (reduced) return;

      const track = scope.querySelector<HTMLElement>('[data-track]');
      if (!track) return;

      const tween = gsap.to(track, {
        xPercent: -50,
        duration: Math.max(items.length, 1) * secondsPerItem,
        ease: 'none',
        repeat: -1,
      });

      const pause = () => tween.pause();
      const play = () => tween.play();
      scope.addEventListener('mouseenter', pause);
      scope.addEventListener('mouseleave', play);
      scope.addEventListener('focusin', pause);
      scope.addEventListener('focusout', play);

      return () => {
        scope.removeEventListener('mouseenter', pause);
        scope.removeEventListener('mouseleave', play);
        scope.removeEventListener('focusin', pause);
        scope.removeEventListener('focusout', play);
      };
    },
    [items.length, secondsPerItem],
  );

  return (
    <div
      ref={root}
      className={cn('overflow-x-auto hide-scrollbar', className)}
      role="region"
      aria-label="Horizontally scrolling gallery"
    >
      <div
        data-track
        className={cn(
          'flex w-max items-center gap-6',
          reduced ? 'snap-x snap-mandatory px-6 pb-4' : 'will-animate',
          trackClassName,
        )}
      >
        {items.map((item, index) => (
          <Fragment key={`a-${getKey(item)}`}>{renderItem(item, index)}</Fragment>
        ))}
        {reduced
          ? null
          : items.map((item, index) => (
              <Fragment key={`b-${getKey(item)}`}>{renderItem(item, index)}</Fragment>
            ))}
      </div>
    </div>
  );
}
