import { cn } from '@/lib/cn';

export const MAIN_CONTENT_ID = 'main-content';

/**
 * First focusable element on the page. Keyboard and screen-reader users can
 * jump straight past the navigation instead of tabbing through it on every
 * route — WCAG 2.4.1.
 *
 * Hidden until focused, never `display: none` (that would make it
 * unfocusable and therefore useless).
 */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className={cn(
        'sr-only focus-visible:not-sr-only',
        'focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100]',
        'focus-visible:rounded-full focus-visible:bg-brand focus-visible:px-5 focus-visible:py-2.5',
        'focus-visible:text-sm focus-visible:font-medium focus-visible:text-brand-contrast',
      )}
    >
      Skip to main content
    </a>
  );
}
