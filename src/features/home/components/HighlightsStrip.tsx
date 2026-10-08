import { Container, Section } from '@/components/common/Container';
import { AnimatedCounter } from '@/components/motion/AnimatedCounter';
import { StaggerGroup } from '@/components/motion/Reveal';
import { STAGGER } from '@/config/animation';
import { HIGHLIGHTS } from '@/data/resume';

/**
 * The four figures stated in the CV.
 *
 * Numeric figures ("6+", "4+", "100%") count up on scroll; "APMP" has no
 * digits to count, so `<AnimatedCounter>` leaves it as static text.
 */
export function HighlightsStrip() {
  return (
    <Section space="sm" className="border-y border-line bg-surface-sunken">
      <Container>
        <StaggerGroup
          as="dl"
          itemSelector="div"
          preset="fade-up"
          className="grid grid-cols-2 gap-8 lg:grid-cols-4"
        >
          {HIGHLIGHTS.map((item, index) => (
            <div key={item.label} className="space-y-2">
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <AnimatedCounter
                  value={item.value}
                  delay={index * STAGGER.base}
                  className="block font-display text-display-sm font-semibold tracking-[-0.03em]"
                />
                <span aria-hidden="true" className="mt-1 block text-sm text-content-muted">
                  {item.label}
                </span>
              </dd>
            </div>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}
