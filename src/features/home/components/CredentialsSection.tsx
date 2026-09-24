import { Award, GraduationCap, Wrench } from 'lucide-react';

import { Container, Section } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Reveal, StaggerGroup } from '@/components/motion/Reveal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CERTIFICATIONS, EDUCATION, TOOL_GROUPS } from '@/data/resume';

/** Certifications, education and the tool stack — all from the CV. */
export function CredentialsSection() {
  return (
    <Section aria-labelledby="credentials-heading">
      <Container className="space-y-14">
        <SectionHeading
          eyebrow="Credentials"
          title="Certified, qualified, tooled."
          description="APMP certification, generative-AI proposal training, computer science degrees, and the platforms used day to day."
        />
        <h2 id="credentials-heading" className="sr-only">
          Credentials
        </h2>

        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal preset="fade-up">
            <Card className="h-full space-y-5">
              <span className="grid size-10 place-items-center rounded-xl bg-surface-sunken text-content">
                <Award aria-hidden="true" className="size-4.5" />
              </span>
              <h3 className="text-base font-semibold tracking-[-0.01em]">Certifications</h3>
              <ul className="space-y-3">
                {CERTIFICATIONS.map((credential) => (
                  <li
                    key={credential.name}
                    className="border-l-2 border-brand pl-4 text-sm leading-relaxed text-content-secondary"
                  >
                    {credential.name}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>

          <Reveal preset="fade-up" delay={0.08}>
            <Card className="h-full space-y-5">
              <span className="grid size-10 place-items-center rounded-xl bg-surface-sunken text-content">
                <GraduationCap aria-hidden="true" className="size-4.5" />
              </span>
              <h3 className="text-base font-semibold tracking-[-0.01em]">Education</h3>
              <ul className="space-y-5">
                {EDUCATION.map((entry) => (
                  <li key={entry.degree} className="space-y-1">
                    <p className="text-sm font-medium text-content">{entry.degree}</p>
                    <p className="text-sm text-content-secondary">{entry.institution}</p>
                    <p className="text-xs text-content-muted">{entry.location}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-surface-sunken text-content">
              <Wrench aria-hidden="true" className="size-4.5" />
            </span>
            <h3 className="text-base font-semibold tracking-[-0.01em]">Tools &amp; platforms</h3>
          </div>

          <StaggerGroup
            as="ul"
            itemSelector="li"
            preset="fade-up"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {TOOL_GROUPS.map((group) => (
              <li key={group.category}>
                <Card padding="sm" className="h-full space-y-3">
                  <p className="text-xs font-medium tracking-wide text-content-muted uppercase">
                    {group.category}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li key={item}>
                        <Badge tone="neutral">{item}</Badge>
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </StaggerGroup>
        </div>
      </Container>
    </Section>
  );
}
