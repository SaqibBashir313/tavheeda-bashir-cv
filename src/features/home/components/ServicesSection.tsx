import { Container, Section } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGroup } from '@/components/motion/Reveal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SERVICES } from '@/data/presentation';

/** Services grouped from `CORE_SKILLS` — a map of what the work covers, not a sales pitch. */
export function ServicesSection() {
  return (
    <Section aria-labelledby="services-heading">
      <Container className="space-y-14">
        <SectionHeading
          eyebrow="Services"
          title="Proposal work, organized."
          description="Capabilities grouped from the CV - a map of what the work covers, not a sales pitch."
        />
        <h2 id="services-heading" className="sr-only">
          Services
        </h2>

        <StaggerGroup
          as="ul"
          itemSelector="li"
          preset="fade-up"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map((service) => (
            <li key={service.title}>
              <Card interactive padding="lg" className="h-full space-y-4">
                <span className="grid size-10 place-items-center rounded-xl bg-surface-sunken text-content">
                  <service.icon aria-hidden="true" className="size-4.5" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold tracking-[-0.01em]">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-content-secondary">{service.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {service.skills.map((skill) => (
                    <Badge key={skill} tone="neutral" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            </li>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}
