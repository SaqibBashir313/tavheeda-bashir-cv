import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/Button';
import { DURATION, EASE, STAGGER } from '@/config/animation';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useAnimatedPresence, useReturnFocus } from '@/hooks';
import { NavLinks } from '@/layouts/components/NavLinks';
import { gsap } from '@/lib/gsap';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Slide-in navigation drawer.
 *
 * Radix Dialog supplies the focus trap, scroll lock, `Escape` handling and
 * `aria-modal`; GSAP choreographs a panel slide with a staggered link reveal.
 * Same `useAnimatedPresence` contract as `<Modal />` and `<Tooltip />`, so
 * there is one enter/exit mental model in the codebase.
 */
export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const onCloseAutoFocus = useReturnFocus();

  const { mounted, ref } = useAnimatedPresence<HTMLDivElement>({
    open,
    enter: (panel) => {
      const timeline = gsap.timeline();

      if (overlayRef.current) {
        timeline.fromTo(
          overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: DURATION.xs },
          0,
        );
      }

      timeline.fromTo(
        panel,
        { xPercent: 100 },
        { xPercent: 0, duration: DURATION.md, ease: EASE.outExpo },
        0,
      );

      // Links arrive after the panel — the detail that makes a drawer feel
      // designed rather than merely functional.
      timeline.fromTo(
        panel.querySelectorAll('[data-nav-item]'),
        { autoAlpha: 0, x: 24 },
        {
          autoAlpha: 1,
          x: 0,
          duration: DURATION.sm,
          ease: EASE.outSoft,
          stagger: STAGGER.base,
          clearProps: 'transform',
        },
        DURATION.xs,
      );

      return timeline;
    },
    exit: (panel, done) => {
      const timeline = gsap.timeline({ onComplete: done });
      timeline.to(panel, { xPercent: 100, duration: DURATION.sm, ease: EASE.inOut }, 0);
      if (overlayRef.current) {
        timeline.to(overlayRef.current, { autoAlpha: 0, duration: DURATION.sm }, 0);
      }
      return timeline;
    },
  });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {mounted ? (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay
            ref={overlayRef}
            className="fixed inset-0 z-50 bg-surface-overlay backdrop-blur-[2px] md:hidden"
          />

          <DialogPrimitive.Content
            ref={ref}
            id="mobile-nav"
            onCloseAutoFocus={onCloseAutoFocus}
            aria-describedby={undefined}
            className="fixed inset-y-0 right-0 z-50 flex w-[min(86vw,22rem)] will-animate flex-col border-l border-line bg-surface-raised p-6 shadow-modal md:hidden"
          >
            <div className="flex items-center justify-between">
              <DialogPrimitive.Title className="text-sm font-semibold tracking-[-0.01em]">
                {SITE.name}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="grid size-9 place-items-center rounded-full text-content-muted transition-colors hover:bg-surface-sunken hover:text-content">
                <X className="size-4" />
                <span className="sr-only">Close navigation</span>
              </DialogPrimitive.Close>
            </div>

            <nav aria-label="Mobile" className="mt-10 flex-1">
              {/* `data-nav-item` marks the stagger targets for the timeline. */}
              <div data-nav-item>
                <NavLinks orientation="vertical" onNavigate={() => onOpenChange(false)} />
              </div>

              <ul className="mt-10 space-y-3">
                {SITE.social.map((link) => (
                  <li key={link.label} data-nav-item>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-content-muted transition-colors hover:text-content"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div data-nav-item className="mt-8">
              <Button asChild fullWidth>
                <Link to={ROUTES.contact} onClick={() => onOpenChange(false)}>
                  Start a project
                </Link>
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      ) : null}
    </DialogPrimitive.Root>
  );
}
