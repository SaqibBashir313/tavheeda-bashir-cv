import { cn } from '@/lib/cn';

export interface SkeletonProps {
  className?: string;
  /** Renders N stacked bars — the common case for text placeholders. */
  lines?: number;
}

/**
 * Loading placeholder. `aria-hidden` plus a single live-region announcement
 * from the consumer beats 12 skeleton bars each shouting "loading".
 */
export function Skeleton({ className, lines }: SkeletonProps) {
  const base = cn(
    'rounded-md bg-linear-to-r from-surface-sunken via-line to-surface-sunken',
    'animate-shimmer bg-[length:200%_100%]',
    className,
  );

  if (!lines) return <div aria-hidden="true" className={cn('h-4 w-full', base)} />;

  return (
    <div aria-hidden="true" className="space-y-2">
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={cn('h-4', base)}
          style={{ width: index === lines - 1 ? '62%' : '100%' }}
        />
      ))}
    </div>
  );
}
