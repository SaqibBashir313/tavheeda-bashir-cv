import { cn } from '@/lib/cn';

const SIZES = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
} as const;

export interface SpinnerProps {
  size?: keyof typeof SIZES;
  className?: string;
  /** Announce progress to assistive tech. Omit inside an already-labelled button. */
  label?: string;
}

/** CSS-only spinner — an infinite GSAP tween would keep the ticker awake. */
export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <>
      <svg
        className={cn('animate-spin text-current', SIZES[size], className)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  );
}
