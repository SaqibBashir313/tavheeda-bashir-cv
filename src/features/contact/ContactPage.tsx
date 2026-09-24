import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { type ComponentType } from 'react';

import { Container, Section } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Reveal, StaggerGroup } from '@/components/motion/Reveal';
import { Card } from '@/components/ui/Card';
import { PROFILE } from '@/data/resume';
import { ContactForm } from '@/features/contact/components/ContactForm';

interface ContactMethod {
  Icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string | null;
}

const METHODS: readonly ContactMethod[] = [
  { Icon: Mail, label: 'Email', value: PROFILE.email, href: `mailto:${PROFILE.email}` },
  {
    Icon: Phone,
    label: 'Phone',
    value: PROFILE.phone,
    href: `tel:${PROFILE.phone.replace(/\s/g, '')}`,
  },
  { Icon: ExternalLink, label: 'LinkedIn', value: 'in/tavheeda-bashir', href: PROFILE.linkedin },
  { Icon: MapPin, label: 'Location', value: PROFILE.location, href: null },
];

export default function ContactPage() {
  return (
    <Section space="lg">
      <Container className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="space-y-10">
          <SectionHeading
            as="h1"
            eyebrow="Contact"
            title="Let's talk about your next pursuit."
            description="Proposal management, capture support, solicitation analysis or compliance review — reach out using whichever channel suits you."
          />

          <StaggerGroup as="ul" itemSelector="li" preset="fade-up" className="space-y-3">
            {METHODS.map(({ Icon, label, value, href }) => (
              <li key={label}>
                <Card padding="sm" className="flex items-center gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-sunken">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs tracking-wide text-content-muted uppercase">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        {...(href.startsWith('http')
                          ? { target: '_blank', rel: 'noreferrer' }
                          : {})}
                        className="text-sm break-words text-brand underline-offset-4 hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-content">{value}</p>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </StaggerGroup>
        </div>

        <Reveal preset="fade-up" delay={0.1}>
          <Card padding="lg">
            <ContactForm />
          </Card>
        </Reveal>
      </Container>
    </Section>
  );
}
