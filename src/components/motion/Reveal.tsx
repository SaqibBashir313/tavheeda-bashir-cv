import { type ReactNode, useMemo } from 'react';

import { type MotionPresetName, SCROLL, STAGGER } from '@/config/animation';
import { useGsapContext } from '@/hooks';
import { cn } from '@/lib/cn';
import { playPreset } from '@/lib/gsap/motion';

export interface RevealProps {
  children: ReactNode;
  /** Element to render. Keep semantics correct — `section`, `ul`, `li`, … */
  as?:
    'div' | 'section' | 'article' | 'header' | 'footer' | 'ul' | 'ol' | 'li' | 'dl' | 'span' | 'p';
  preset?: MotionPresetName;
  /** Seconds before the tween starts once triggered. */
  delay?: number;
  /**
   * Animate children in sequence instead of the wrapper as one block.
   * `true` uses the default rhythm; a number overrides it.
   */
  stagger?: boolean | number;
  /** CSS selector for staggered items. Defaults to direct children. */
  itemSelector?: string;
  /** ScrollTrigger `start`. Defaults to `top 85%`. */
  start?: string;
  /** Animate once (default) or replay every time it re-enters the viewport. */
  once?: boolean;
  /** Play immediately on mount instead of waiting for scroll. */
  immediate?: boolean;
  className?: string;
}

/**
 * The workhorse scroll-reveal wrapper.
 *
 * Wrap anything; it animates on scroll with one of the shared presets. All the
 * ScrollTrigger and reduced-motion handling is inherited from
 * `useGsapContext` + `playPreset`, so this component is ~20 lines of real code
 * and every reveal in the app behaves identically.
 *
 * Progressive enhancement: nothing is hidden by CSS. GSAP applies the `from`
 * state itself, so if the bundle fails to load the content is simply visible —
 * never a blank page.
 *
 * @example
 * <Reveal as="ul" stagger itemSelector="li" preset="fade-up">
 *   {items.map((item) => <li key={item.id}>{item.label}</li>)}
 * </Reveal>
 */
export function Reveal({
  children,
  as = 'div',
  preset = 'fade-up',
  delay,
  stagger = false,
  itemSelector,
  start = SCROLL.start,
  once = true,
  immediate = false,
  className,
}: RevealProps) {
  const staggerAmount = useMemo(() => {
    if (stagger === false) return undefined;
    return stagger === true ? STAGGER.base : stagger;
  }, [stagger]);

  const root = useGsapContext<HTMLElement>(
    ({ scope, reduced }) => {
      // `:scope > *` keeps the stagger to *direct* children, so nested
      // structures don't animate their grandchildren twice.
      const targets =
        staggerAmount === undefined
          ? scope
          : Array.from(scope.querySelectorAll<HTMLElement>(itemSelector ?? ':scope > *'));

      if (Array.isArray(targets) && targets.length === 0) return;

      playPreset({
        targets,
        preset,
        reduced,
        ...(delay === undefined ? {} : { delay }),
        ...(staggerAmount === undefined ? {} : { stagger: staggerAmount }),
        ...(immediate
          ? {}
          : {
              scrollTrigger: { trigger: scope, start, once, toggleActions: 'play none none none' },
            }),
      });
    },
    [preset, delay, staggerAmount, itemSelector, start, once, immediate],
  );

  // Cast: `as` is constrained to intrinsic elements that all accept a ref.
  const Component = as as 'div';

  return (
    <Component ref={root as React.Ref<HTMLDivElement>} className={cn('will-animate', className)}>
      {children}
    </Component>
  );
}

/** Pre-configured `<Reveal stagger>` — the shape used most across the app. */
export function StaggerGroup(props: Omit<RevealProps, 'stagger'> & { amount?: number }) {
  const { amount = STAGGER.base, ...rest } = props;
  return <Reveal {...rest} stagger={amount} />;
}
