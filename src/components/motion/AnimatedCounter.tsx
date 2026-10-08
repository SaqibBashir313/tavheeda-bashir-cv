import { useMemo } from 'react';

import { DURATION, EASE, SCROLL } from '@/config/animation';
import { useGsapContext } from '@/hooks';
import { cn } from '@/lib/cn';
import { gsap } from '@/lib/gsap';

export interface AnimatedCounterProps {
  /** Raw CV figure, e.g. `"6+"`, `"100%"`, `"APMP"`. */
  value: string;
  /** Seconds before the count starts once triggered. */
  delay?: number;
  className?: string;
}

/** Leading integer plus whatever symbol follows it (`"+"`, `"%"`, …). */
const NUMERIC = /^(\d+)(.*)$/;

/**
 * Counts up to the number embedded in a CV figure ("6+" ticks 0 → 6, then
 * holds the "+"). Values with no leading integer (e.g. "APMP") have nothing
 * to count, so they render as static text — inventing a count-up for a
 * credential would misrepresent it.
 */
export function AnimatedCounter({ value, delay, className }: AnimatedCounterProps) {
  const match = useMemo(() => value.match(NUMERIC), [value]);

  const root = useGsapContext<HTMLSpanElement>(
    ({ scope, reduced }) => {
      if (!match) return;

      const target = Number(match[1]);
      const suffix = match[2];

      if (reduced) {
        scope.textContent = value;
        return;
      }

      scope.textContent = `0${suffix}`;
      const counter = { value: 0 };

      gsap.to(counter, {
        value: target,
        duration: DURATION.xl,
        ease: EASE.outSoft,
        delay,
        scrollTrigger: { trigger: scope, start: SCROLL.start, once: true },
        onUpdate: () => {
          scope.textContent = `${Math.round(counter.value)}${suffix}`;
        },
      });
    },
    [value, match, delay],
  );

  return (
    <span ref={root} className={cn('tabular-nums', className)}>
      {value}
    </span>
  );
}
