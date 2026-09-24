import { Link } from 'react-router';

import { Container, Section } from '@/components/common/Container';
import { AnimatedText } from '@/components/motion/AnimatedText';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes';

export default function NotFoundPage() {
  return (
    <Section space="lg">
      <Container className="max-w-xl space-y-8">
        <p className="font-mono text-sm text-content-muted">404</p>

        <AnimatedText as="h1" unit="char" immediate className="text-display-md font-semibold">
          Nothing here.
        </AnimatedText>

        <Reveal immediate preset="fade-up" delay={0.3} as="p" className="text-content-secondary">
          That page has either moved or never existed. Both are recoverable.
        </Reveal>

        <Reveal immediate preset="fade-up" delay={0.4}>
          <Button asChild>
            <Link to={ROUTES.home}>Back to home</Link>
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
