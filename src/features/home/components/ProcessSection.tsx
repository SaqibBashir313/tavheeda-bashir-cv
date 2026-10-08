import { Container, Section } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { PROCESS_STEPS } from '@/data/presentation';
import { useGsapContext } from '@/hooks';
import { gsap } from '@/lib/gsap';
import { batchReveal } from '@/lib/gsap/motion';

/**
 * The proposal lifecycle as a vertical timeline, with a scroll-scrubbed
 * progress line standing in for a single continuous pursuit — the one place
 * in this batch that legitimately needs raw GSAP instead of the usual
 * `<Reveal>` / `<StaggerGroup>` primitives.
 */
export function ProcessSection() {
  const root = useGsapContext<HTMLDivElement>(({ scope, reduced }) => {
    const items = Array.from(scope.querySelectorAll<HTMLElement>('li'));
    if (items.length > 0) batchReveal(items, { preset: 'fade-up', reduced });

    const fill = scope.querySelector<HTMLElement>('[data-progress]');
    if (!fill) return;

    if (reduced) {
      gsap.set(fill, { scaleY: 1 });
      return;
    }

    gsap.fromTo(
      fill,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: scope,
          start: 'top 70%',
          end: 'bottom 70%',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      },
    );
  }, []);

  return (
    <Section aria-labelledby="process-heading">
      <Container className="space-y-14">
        <SectionHeading
          eyebrow="Process"
          title="How a proposal actually gets built."
          description="The same six-stage lifecycle repeats across every pursuit - condensed from the role history on this site."
        />
        <h2 id="process-heading" className="sr-only">
          Process
        </h2>

        <div ref={root} className="relative pl-12 sm:pl-16">
          <div aria-hidden="true" className="absolute top-2 bottom-2 left-4 w-px bg-line sm:left-5">
            <div data-progress className="will-animate absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-brand" />
          </div>

          <ol className="space-y-12">
            {PROCESS_STEPS.map((item) => (
              <li key={item.step} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-0 -left-12 grid size-8 place-items-center rounded-full border border-line bg-surface-raised font-mono text-xs text-content-muted sm:-left-16 sm:size-10"
                >
                  {item.step}
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-brand">
                    <item.icon aria-hidden="true" className="size-4" />
                    <h3 className="text-base font-semibold tracking-[-0.01em] text-content">{item.title}</h3>
                  </div>
                  <p className="max-w-xl text-sm leading-relaxed text-content-secondary">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
