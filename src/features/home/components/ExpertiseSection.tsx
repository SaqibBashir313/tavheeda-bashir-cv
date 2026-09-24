import { Container, Section } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGroup } from '@/components/motion/Reveal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CORE_SKILLS, DELIVERABLES, SOFT_SKILLS } from '@/data/resume';

/**
 * Core skills, proposal deliverables and soft skills — each list rendered from
 * `resume.ts` rather than hand-written markup, so the CV stays the only source.
 */
export function ExpertiseSection() {
  return (
    <Section aria-labelledby="expertise-heading">
      <Container className="space-y-14">
        <SectionHeading
          eyebrow="Capability"
          title="Proposal expertise, end to end."
          description="Skills as listed on the CV: from capture and solicitation analysis through compliance, writing and production coordination."
        />
        <h2 id="expertise-heading" className="sr-only">
          Expertise
        </h2>

        <StaggerGroup
          as="ul"
          itemSelector="li"
          preset="fade-up"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CORE_SKILLS.map((skill) => (
            <li key={skill}>
              <Card padding="sm" className="h-full">
                <p className="text-sm leading-relaxed font-medium text-content">{skill}</p>
              </Card>
            </li>
          ))}
        </StaggerGroup>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-5">
            <h3 className="text-base font-semibold tracking-[-0.01em]">
              Proposal sections &amp; artefacts
            </h3>
            <StaggerGroup
              as="ul"
              itemSelector="li"
              preset="fade"
              amount={0.03}
              className="flex flex-wrap gap-2"
            >
              {DELIVERABLES.map((item) => (
                <li key={item}>
                  <Badge tone="neutral" size="md">
                    {item}
                  </Badge>
                </li>
              ))}
            </StaggerGroup>
          </div>

          <div className="space-y-5">
            <h3 className="text-base font-semibold tracking-[-0.01em]">Soft skills</h3>
            <StaggerGroup
              as="ul"
              itemSelector="li"
              preset="fade"
              amount={0.03}
              className="flex flex-wrap gap-2"
            >
              {SOFT_SKILLS.map((item) => (
                <li key={item}>
                  <Badge tone="brand" size="md">
                    {item}
                  </Badge>
                </li>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </Container>
    </Section>
  );
}
