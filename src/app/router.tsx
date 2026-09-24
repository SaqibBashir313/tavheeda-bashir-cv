/* eslint-disable react-refresh/only-export-components -- this module's
   export is the router object itself; the lazy route components are
   intentionally declared here so the route table reads in one place. */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ROUTES } from '@/config/routes';
import { RootLayout } from '@/layouts/RootLayout';

/**
 * Route-level code splitting.
 *
 * `React.lazy` + the `<Suspense>` boundary in `RootLayout` means each page is
 * its own chunk: visiting the home page never downloads Swiper, and the
 * experience chunk is fetched only when that route is entered.
 *
 * `HomePage` is lazy too — it costs one extra request on first paint but keeps
 * the entry chunk to just the shell, which is the faster trade for a site
 * where a visitor may well arrive on a deep link.
 */
const HomePage = lazy(() => import('@/features/home/HomePage'));
const ExperiencePage = lazy(() => import('@/features/experience/ExperiencePage'));
const ContactPage = lazy(() => import('@/features/contact/ContactPage'));
const NotFoundPage = lazy(() => import('@/features/misc/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <RootLayout />,
    // A crash while *resolving* a route (bad chunk, failed loader) is caught
    // here; crashes while rendering a page are caught inside the layout.
    errorElement: (
      <ErrorBoundary>
        <NotFoundPage />
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.experience, element: <ExperiencePage /> },
      { path: ROUTES.contact, element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
