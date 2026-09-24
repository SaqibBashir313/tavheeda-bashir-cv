import { Menu } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';

import { Container } from '@/components/common/Container';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { ThemeToggle } from '@/features/theme';
import { MobileNav } from '@/layouts/components/MobileNav';
import { NavLinks } from '@/layouts/components/NavLinks';
import { cn } from '@/lib/cn';
import { selectMobileNavOpen, useUiStore } from '@/store/ui.store';

/**
 * Sticky header.
 *
 * The blur + translucent background is a `backdrop-filter`, which the
 * compositor handles; a scroll-listener-driven `useState` would re-render this
 * subtree on every frame instead.
 */
export function Header() {
  const isMobileNavOpen = useUiStore(selectMobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const location = useLocation();

  // Close the drawer on navigation — otherwise it stays open over the new page.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-surface/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          to={ROUTES.home}
          className="group flex items-center gap-2.5 rounded-full py-1 pr-2 text-sm font-semibold"
        >
          <span
            className={cn(
              'grid size-8 place-items-center rounded-lg bg-content text-xs font-bold',
              'text-surface transition-transform duration-300 ease-[var(--ease-out-soft)]',
              'group-hover:scale-105 group-hover:rotate-[-6deg]',
            )}
            aria-hidden="true"
          >
            {SITE.shortName}
          </span>
          <span className="tracking-[-0.015em]">{SITE.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          {/* No tooltip here on purpose: a radio group is not a single
              tooltip trigger, and wrapping it in a focusable `<span>` would
              add a meaningless tab stop. Each option carries its own label
              and `title` instead. */}
          <ThemeToggle />

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to={ROUTES.contact}>Start a project</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open navigation</span>
          </Button>
        </div>
      </Container>

      <ScrollProgress className="absolute inset-x-0 -bottom-px" />

      <MobileNav open={isMobileNavOpen} onOpenChange={setMobileNavOpen} />
    </header>
  );
}
