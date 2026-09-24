import { type HTMLAttributes } from 'react';

import {
  type ContainerVariantProps,
  containerVariants,
  SECTION_SPACE,
} from '@/components/common/Container.variants';
import { cn } from '@/lib/cn';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement>, ContainerVariantProps {}

/**
 * Horizontal rhythm, defined once.
 *
 * Every page uses this instead of re-typing `mx-auto max-w-7xl px-6 lg:px-12`,
 * which is how gutters silently drift apart between sections.
 */
export function Container({ className, width, gutter, ...props }: ContainerProps) {
  return <div className={cn(containerVariants({ width, gutter }), className)} {...props} />;
}

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Vertical rhythm step. */
  space?: keyof typeof SECTION_SPACE;
}

export function Section({ className, space = 'md', ...props }: SectionProps) {
  return <section className={cn(SECTION_SPACE[space], className)} {...props} />;
}
