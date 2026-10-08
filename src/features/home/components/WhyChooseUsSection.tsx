import { Container, Section } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGroup } from '@/components/motion/Reveal';
import { Card } from '@/components/ui/Card';
import { WHY_CHOOSE_US } from '@/data/presentation';

/** Value-prop restatement of claims already made in Credentials and Experience. */
export function WhyChooseUsSection() {
  return (
    <Section aria-labelledby="why-heading">
      <Container className="space-y-14">
        <SectionHeading
          eyebrow="Why work with me"
          title="Built for compliance, led like a team sport."
          description="Four things that come up in every engagement."
        />
        <h2 id="why-heading" className="sr-only">
          Why choose me
        </h2>

        <StaggerGroup as="ul" itemSelector="li" preset="fade-up" className="grid gap-5 sm:grid-cols-2">
          {WHY_CHOOSE_US.map((item) => (
            <li key={item.title}>
              <Card padding="lg" className="h-full space-y-4">
                <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                  <item.icon aria-hidden="true" className="size-4.5" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold tracking-[-0.01em]">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-content-secondary">{item.description}</p>
                </div>
              </Card>
            </li>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}
