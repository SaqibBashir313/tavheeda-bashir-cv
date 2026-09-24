import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router';

import { Container } from '@/components/common/Container';
import { AnimatedText } from '@/components/motion/AnimatedText';
import { Reveal } from '@/components/motion/Reveal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DURATION, EASE } from '@/config/animation';
import { ROUTES } from '@/config/routes';
import { PROFILE } from '@/data/resume';
import { useGsapContext } from '@/hooks';
import { gsap } from '@/lib/gsap';

const CONTACT_LINES = [
  { Icon: Mail, label: PROFILE.email, href: `mailto:${PROFILE.email}` },
  { Icon: Phone, label: PROFILE.phone, href: `tel:${PROFILE.phone.replace(/\s/g, '')}` },
  { Icon: MapPin, label: PROFILE.location, href: null },
] as const;

/**
 * Above-the-fold introduction.
 *
 * Headline motion is `immediate` (no ScrollTrigger) because the element is
 * already in view on load — waiting for a scroll event would leave the first
 * thing a recruiter sees invisible.
 */
export function HeroSection() {
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
      { autoAlpha: 0.6, scale: 1, duration: DURATION.xl, ease: EASE.outExpo },
    );

    // Parallax: the glow drifts at ~40% of scroll speed. Transform only.
    gsap.to(glow, {
      yPercent: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
  });

  return (
    <div ref={root} className="relative overflow-hidden">
      <div
        data-glow
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 will-animate rounded-full blur-3xl"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-brand) 0%, transparent 65%)',
          opacity: 0,
        }}
      />

      <Container className="relative pt-24 pb-20 sm:pt-32 sm:pb-28">
        <Reveal immediate preset="fade" className="mb-8">
          <Badge tone="brand" size="md">
            {PROFILE.title} · APMP Certified
          </Badge>
        </Reveal>

        <AnimatedText
          as="h1"
          unit="line"
          immediate
          delay={0.08}
          className="max-w-4xl text-display-lg font-semibold"
        >
          {PROFILE.fullName}
        </AnimatedText>

        <Reveal
          immediate
          preset="fade-up"
          delay={0.4}
          as="p"
          className="mt-6 max-w-2xl text-lg leading-relaxed text-content-secondary sm:text-xl"
        >
          {PROFILE.headline}
        </Reveal>

        <Reveal immediate stagger delay={0.55} className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
          {CONTACT_LINES.map(({ Icon, label, href }) => (
            <span key={label} className="flex items-center gap-2 text-sm text-content-muted">
              <Icon aria-hidden="true" className="size-4" />
              {href ? (
                <a href={href} className="transition-colors hover:text-content">
                  {label}
                </a>
              ) : (
                label
              )}
            </span>
          ))}
        </Reveal>

        <Reveal immediate stagger delay={0.7} className="mt-10 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" rightIcon={<ArrowRight className="size-4" />}>
            <Link to={ROUTES.experience}>View experience</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to={ROUTES.contact}>Get in touch</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </Button>
        </Reveal>
      </Container>
    </div>
  );
}
