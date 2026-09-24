import { useGsapContext } from '@/hooks';
import { cn } from '@/lib/cn';
import { gsap } from '@/lib/gsap';

/**
 * Reading-progress bar.
 *
 * Scrubbed by ScrollTrigger rather than a `scroll` listener + `setState`:
 * the latter would re-render the whole header on every scroll frame. Here the
 * only thing that changes is one element's `scaleX`, on the compositor.
 */
export function ScrollProgress({ className }: { className?: string }) {
  const root = useGsapContext<HTMLDivElement>(({ scope, reduced }) => {
    const bar = scope.querySelector<HTMLElement>('[data-bar]');
    if (!bar) return;

    if (reduced) {
      // A progress indicator is information, not decoration — keep it, but
      // without a scrubbed animation.
      gsap.set(bar, { scaleX: 0 });
      const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        gsap.set(bar, { scaleX: max <= 0 ? 0 : window.scrollY / max });
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
      return () => window.removeEventListener('scroll', update);
    }

    gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  return (
    <div ref={root} className={cn('h-px w-full overflow-hidden bg-line/60', className)}>
      <div data-bar aria-hidden="true" className="h-full origin-left will-animate bg-brand" />
    </div>
  );
}
