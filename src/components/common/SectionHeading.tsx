import { type ReactNode } from 'react';

import { AnimatedText } from '@/components/motion/AnimatedText';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';

export interface SectionHeadingProps {
  /** Small label above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  children?: ReactNode;
  className?: string;
}

/**
 * The section header used by every page — eyebrow, title, description.
 *
 * Centralising it is what keeps typographic hierarchy consistent: one place
 * decides the type scale, the colour of the eyebrow and the reveal rhythm,
 * so no two sections drift apart visually.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as = 'h2',
  children,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex max-w-2xl flex-col gap-4',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      {eyebrow ? (
        <Reveal preset="fade" className="text-sm font-medium tracking-wide text-brand uppercase">
          {eyebrow}
        </Reveal>
      ) : null}

      <AnimatedText
        as={as}
        unit="line"
        className={cn(
          as === 'h1' ? 'text-display-lg' : 'text-display-sm sm:text-display-md',
          'font-semibold',
        )}
      >
        {title}
      </AnimatedText>

      {description ? (
        <Reveal
          preset="fade-up"
          delay={0.1}
          as="p"
          className="text-base leading-relaxed text-content-secondary sm:text-lg"
        >
          {description}
        </Reveal>
      ) : null}

      {children}
    </div>
  );
}
