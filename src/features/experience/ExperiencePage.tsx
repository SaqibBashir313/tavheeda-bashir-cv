import { useCallback, useEffect, useState } from 'react';

import { Container, Section } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Reveal, StaggerGroup } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { CONTRACT_VEHICLES, type Role } from '@/data/resume';
import { DomainsRail } from '@/features/experience/components/DomainsRail';
import { RoleCard } from '@/features/experience/components/RoleCard';
import { VehiclesCarousel } from '@/features/experience/components/VehiclesCarousel';
import { useRoles } from '@/features/experience/hooks/useRoles';
import { toast } from '@/features/notifications';
import { useDisclosure } from '@/hooks';
import { getErrorMessage } from '@/utils/error';

function RolesSkeleton() {
  return (
    <div aria-busy="true" className="space-y-5">
      <span className="sr-only">Loading work history…</span>
      {Array.from({ length: 2 }, (_, index) => (
        <Card key={index} className="space-y-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-40" />
          <Skeleton lines={4} />
        </Card>
      ))}
    </div>
  );
}

export default function ExperiencePage() {
  const { data, isLoading, isError, error, run } = useRoles();
  const detail = useDisclosure();
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  const openRole = useCallback(
    (role: Role) => {
      setActiveRole(role);
      detail.open();
    },
    [detail],
  );

  // Surface failures through the shared toast system rather than a bespoke
  // banner — one notification pattern for the whole app.
  useEffect(() => {
    if (!isError) return;
    toast.error('Could not load work history', {
      description: getErrorMessage(error),
      action: { label: 'Retry', onClick: () => void run() },
    });
  }, [isError, error, run]);

  const roles = data ?? [];

  return (
    <>
      <Section space="lg">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Work history"
            title="Six years of proposals, four roles."
            description="Every responsibility below is taken verbatim from the CV. Open a role to read the full list."
          />
        </Container>
      </Section>

      <Section space="sm" aria-labelledby="roles-heading">
        <Container>
          <h2 id="roles-heading" className="sr-only">
            Roles
          </h2>

          {isLoading ? <RolesSkeleton /> : null}

          {!isLoading && roles.length > 0 ? (
            <StaggerGroup as="div" preset="fade-up" className="space-y-5">
              {roles.map((role) => (
                <div key={role.id}>
                  <RoleCard role={role} onOpen={openRole} />
                </div>
              ))}
            </StaggerGroup>
          ) : null}

          {isError ? (
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-line p-8">
              <p className="text-sm text-content-secondary">{getErrorMessage(error)}</p>
              <Button variant="secondary" size="sm" onClick={() => void run()}>
                Try again
              </Button>
            </div>
          ) : null}
        </Container>
      </Section>

      <Section space="sm" aria-labelledby="vehicles-heading">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Contract vehicles"
            title="Vehicles worked and managed."
            description="Hover or focus a card to see the role it was worked under."
          />
          <h2 id="vehicles-heading" className="sr-only">
            Contract vehicles
          </h2>
          <Reveal preset="scale-in" delay={0.1}>
            <VehiclesCarousel vehicles={CONTRACT_VEHICLES} />
          </Reveal>
        </Container>
      </Section>

      <section aria-labelledby="rail-heading" className="py-10">
        <Container className="mb-10">
          <SectionHeading
            title="Domains & agencies."
            description="On desktop this section pins and converts vertical scroll into horizontal movement. On touch devices it becomes a native scroll-snap rail."
          />
          <h2 id="rail-heading" className="sr-only">
            Domains &amp; agencies
          </h2>
        </Container>
        <DomainsRail />
      </section>

      <Modal
        open={detail.isOpen}
        onOpenChange={detail.setOpen}
        size="lg"
        title={activeRole ? `${activeRole.title} — ${activeRole.company}` : 'Role detail'}
        description={activeRole ? `${activeRole.location} · ${activeRole.period}` : undefined}
      >
        {activeRole ? (
          <ul className="space-y-3">
            {activeRole.highlights.map((highlight) => (
              <li
                key={highlight}
                className="border-l-2 border-line pl-4 text-sm leading-relaxed text-content-secondary"
              >
                {highlight}
              </li>
            ))}
          </ul>
        ) : null}
      </Modal>
    </>
  );
}
