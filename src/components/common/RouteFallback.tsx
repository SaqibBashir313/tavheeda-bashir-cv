import { Container, Section } from '@/components/common/Container';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Suspense fallback for lazily-loaded routes.
 *
 * It mirrors the *shape* of a page (heading block + grid) rather than showing
 * a centred spinner, so the layout does not jump when the real content
 * arrives. One live-region announcement covers the whole screen.
 */
export function RouteFallback() {
  return (
    <Section aria-busy="true" aria-live="polite">
      <Container className="space-y-12">
        <span className="sr-only">Loading page…</span>

        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-line p-6">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton lines={3} />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
