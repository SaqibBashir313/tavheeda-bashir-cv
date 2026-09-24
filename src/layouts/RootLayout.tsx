import { Suspense } from 'react';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RouteFallback } from '@/components/common/RouteFallback';
import { MAIN_CONTENT_ID, SkipLink } from '@/components/common/SkipLink';
import { RouteTransition } from '@/components/motion/RouteTransition';
import { Footer } from '@/layouts/components/Footer';
import { Header } from '@/layouts/components/Header';

/**
 * The application shell: everything that persists across routes.
 *
 * Order matters here —
 *  `<SkipLink>` first so it is the first tab stop;
 *  `<ErrorBoundary>` *inside* the shell so a crashed page keeps its
 *  navigation and remains recoverable;
 *  `<Suspense>` inside that, so lazy chunks show the page-shaped fallback
 *  rather than blanking the whole app.
 */
export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SkipLink />
      <Header />

      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 focus-visible:outline-none">
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <RouteTransition />
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}
