import { Container, Section } from '@/components/common/Container';
import { AnimatedText } from '@/components/motion/AnimatedText';
import { Reveal } from '@/components/motion/Reveal';
import { PROFILE } from '@/data/resume';

/** The professional summary, verbatim from the CV. */
export function SummarySection() {
  return (
    <Section aria-labelledby="summary-heading">
      <Container className="max-w-3xl">
        <AnimatedText
          as="h2"
          unit="line"
          className="text-display-sm font-semibold sm:text-display-md"
        >
          Professional summary
        </AnimatedText>
        <span id="summary-heading" className="sr-only">
          Professional summary
        </span>

        <Reveal
          preset="fade-up"
          delay={0.1}
          as="p"
          className="mt-8 text-base leading-[1.75] text-content-secondary sm:text-lg"
        >
          {PROFILE.summary}
        </Reveal>
      </Container>
    </Section>
  );
}
