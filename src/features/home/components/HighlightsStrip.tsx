import { Container, Section } from '@/components/common/Container';
import { StaggerGroup } from '@/components/motion/Reveal';
import { HIGHLIGHTS } from '@/data/resume';

/**
 * The four figures stated in the CV.
 *
 * Deliberately *not* animated counters: "APMP" is not a number, and inventing
 * a count-up for a credential would misrepresent it. Plain staggered reveal.
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
          {HIGHLIGHTS.map((item) => (
            <div key={item.label} className="space-y-2">
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <span className="block font-display text-display-sm font-semibold tracking-[-0.03em] tabular-nums">
                  {item.value}
                </span>
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
