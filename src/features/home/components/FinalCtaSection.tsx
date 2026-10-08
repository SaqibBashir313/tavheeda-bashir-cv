import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { Container, Section } from '@/components/common/Container';
import { AnimatedText } from '@/components/motion/AnimatedText';
import { Reveal } from '@/components/motion/Reveal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DURATION, EASE, SCROLL } from '@/config/animation';
import { ROUTES } from '@/config/routes';
import { FINAL_CTA } from '@/data/presentation';
import { useGsapContext } from '@/hooks';
import { gsap } from '@/lib/gsap';

/**
 * Closing call to action.
 *
 * Reuses the hero's radial-glow motif so the page bookends itself, but the
 * glow fades/scales in on scroll rather than on mount — this band sits well
 * below the fold.
 */
export function FinalCtaSection() {
  const root = useGsapContext<HTMLDivElement>(({ scope, reduced }) => {
    const glow = scope.querySelector<HTMLElement>('[data-glow]');
    if (!glow) return;

    if (reduced) {
      gsap.set(glow, { autoAlpha: 0.6 });
      return;
    }

    gsap.fromTo(
      glow,
      { autoAlpha: 0, scale: 0.85 },
      {
        autoAlpha: 0.6,
        scale: 1,
        duration: DURATION.xl,
        ease: EASE.outExpo,
        scrollTrigger: {
          trigger: scope,
          start: SCROLL.start,
          once: true,
          toggleActions: 'play none none none',
        },
      },
    );
  });

  return (
    <Section className="relative overflow-hidden border-t border-line bg-surface-sunken">
      <div ref={root}>
        <div
          data-glow
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 will-animate rounded-full blur-3xl"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--color-brand) 0%, transparent 65%)',
            opacity: 0,
          }}
        />

        <Container className="relative flex flex-col items-center gap-6 py-20 text-center sm:py-28">
          <Badge tone="brand" size="md">
            {FINAL_CTA.eyebrow}
          </Badge>

          <AnimatedText as="h2" unit="line" className="max-w-3xl text-display-md font-semibold">
            {FINAL_CTA.title}
          </AnimatedText>

          <Reveal
            as="p"
            preset="fade-up"
            delay={0.1}
            className="max-w-xl text-lg leading-relaxed text-content-secondary"
          >
            {FINAL_CTA.description}
          </Reveal>

          <Reveal preset="fade-up" delay={0.2} className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" rightIcon={<ArrowRight className="size-4" />}>
              <Link to={ROUTES.contact}>Start a project</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to={ROUTES.experience}>View experience</Link>
            </Button>
          </Reveal>
        </Container>
      </div>
    </Section>
  );
}
