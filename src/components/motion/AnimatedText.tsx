import { SCROLL, TEXT_REVEAL } from '@/config/animation';
import { useGsapContext } from '@/hooks';
import { cn } from '@/lib/cn';
import { gsap } from '@/lib/gsap';
import { splitText, type SplitUnit } from '@/lib/gsap/splitText';

export interface AnimatedTextProps {
  /** Plain text only — the splitter works on `textContent`. */
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  /** Granularity of the reveal. `line` reads calmest for long copy. */
  unit?: SplitUnit;
  /** Wrap each unit in an overflow-hidden window (the premium look). */
  mask?: boolean;
  delay?: number;
  stagger?: number;
  duration?: number;
  start?: string;
  once?: boolean;
  /** Play on mount instead of on scroll — use for above-the-fold headlines. */
  immediate?: boolean;
  className?: string;
}

/**
 * Mask-based text reveal.
 *
 * Accessibility is the whole trick here. Splitting a sentence into 40 spans
 * makes most screen readers announce 40 fragments, so we render the text
 * twice: a visually-hidden clean copy for assistive tech, and an
 * `aria-hidden` copy that gets shredded and animated. Selection and SEO both
 * still see real text.
 *
 * The split DOM is rebuilt on every relevant change and reverted by the GSAP
 * context on cleanup, so line-splitting stays correct across re-renders.
 *
 * @example
 * <AnimatedText as="h1" unit="line" immediate className="text-display-lg">
 *   {PROFILE.fullName}
 * </AnimatedText>
 */
export function AnimatedText({
  children,
  as = 'span',
  unit = 'word',
  mask = true,
  delay,
  stagger,
  duration,
  start = SCROLL.start,
  once = true,
  immediate = false,
  className,
}: AnimatedTextProps) {
  const root = useGsapContext<HTMLElement>(
    ({ scope, reduced }) => {
      const target = scope.querySelector<HTMLElement>('[data-split-root]');
      if (!target) return;

      const split = splitText(target, { unit, mask });
      if (split.targets.length === 0) return split.revert;

      const config = TEXT_REVEAL[unit];

      if (reduced) {
        gsap.set(split.targets, { yPercent: 0, autoAlpha: 1 });
        return split.revert;
      }

      gsap.fromTo(
        split.targets,
        // Unmasked reveals need opacity too; masked ones are hidden by the
        // clipping wrapper, so a pure translate reads cleaner.
        { yPercent: 110, ...(mask ? {} : { autoAlpha: 0 }) },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: duration ?? config.duration,
          stagger: stagger ?? config.stagger,
          ease: config.ease,
          clearProps: 'transform',
          ...(delay === undefined ? {} : { delay }),
          ...(immediate
            ? {}
            : {
                scrollTrigger: {
                  trigger: scope,
                  start,
                  once,
                  toggleActions: 'play none none none',
                },
              }),
        },
      );

      // Returned to the GSAP context: restores the original markup on cleanup.
      return split.revert;
    },
    [children, unit, mask, delay, stagger, duration, start, once, immediate],
  );

  const Component = as as 'span';

  return (
    <Component ref={root} className={cn('block', className)}>
      <span className="sr-only">{children}</span>
      <span data-split-root aria-hidden="true" className="block will-animate">
        {children}
      </span>
    </Component>
  );
}
