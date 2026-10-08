import {
  Anchor,
  Cpu,
  HardHat,
  House,
  type LucideIcon,
  Medal,
  Plane,
  RadioTower,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Wheat,
  Workflow,
} from 'lucide-react';

import { HorizontalScroll } from '@/components/motion/HorizontalScroll';
import { Badge } from '@/components/ui/Badge';
import { AGENCIES, DOMAINS } from '@/data/resume';
import { cn } from '@/lib/cn';

/** Hue per panel — generated, so no image assets and it re-themes itself. */
const HUE_STEP = 42;

/**
 * One line-art mark per panel instead of stock photography — crisp at any
 * size, re-colors with the generated gradient for free, and ships zero image
 * weight. Picked for what the title names, not decoration.
 */
const PANEL_ICONS: Record<string, LucideIcon> = {
  IT: Cpu,
  Telecommunications: RadioTower,
  'Systems Integration': Workflow,
  'Public Safety': ShieldCheck,
  Healthcare: Stethoscope,
  Staffing: Users,
  'Facilities / Janitorial Services': HardHat,
  'U.S. Department of Defense': Shield,
  Army: Medal,
  Navy: Anchor,
  'U.S. Air Force': Plane,
  'Department of Agriculture': Wheat,
  'Department of Housing and Urban Development': House,
};

interface Panel {
  kind: string;
  title: string;
  detail: string;
  icon: LucideIcon;
}

/**
 * Pinned horizontal rail of delivery domains and the agencies named in the CV.
 *
 * Panels are sized in viewport units so the rail's total width — and therefore
 * its scroll distance — is derived from layout rather than hard-coded, which
 * keeps it correct at every breakpoint and after a resize.
 */
export function DomainsRail() {
  const panels: Panel[] = [
    ...DOMAINS.map((domain) => ({
      kind: 'Domain',
      title: domain,
      detail: 'Proposals developed in this domain',
      icon: PANEL_ICONS[domain] ?? Sparkles,
    })),
    ...AGENCIES.map((agency) => ({
      kind: 'Agency',
      title: agency,
      detail: 'Management sections authored for this customer',
      icon: PANEL_ICONS[agency] ?? Sparkles,
    })),
  ];

  return (
    <HorizontalScroll trackClassName="lg:px-[12vw]">
      {panels.map((panel, index) => (
        <article
          key={panel.title}
          className={cn(
            'relative flex h-[52vh] w-[74vw] shrink-0 snap-center flex-col justify-end',
            'overflow-hidden rounded-3xl p-8 text-white sm:w-[46vw] lg:h-[54vh] lg:w-[32vw]',
          )}
          style={{
            backgroundImage: `linear-gradient(150deg, oklch(58% 0.17 ${String(index * HUE_STEP)}), oklch(70% 0.13 ${String(index * HUE_STEP + 40)}))`,
          }}
        >
          <span
            aria-hidden="true"
            className="absolute top-6 right-6 font-mono text-xs tracking-widest text-white/70"
          >
            {String(index + 1).padStart(2, '0')} / {String(panels.length).padStart(2, '0')}
          </span>

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent"
          />

          <panel.icon
            aria-hidden="true"
            strokeWidth={1}
            className="absolute inset-x-0 top-10 bottom-28 m-auto size-24 text-white/20 sm:size-28 lg:size-32"
          />

          <div className="relative space-y-3">
            <Badge tone="neutral" className="bg-white/15 text-white backdrop-blur-sm">
              {panel.kind}
            </Badge>
            <h3 className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em] sm:text-3xl">
              {panel.title}
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-white/85">{panel.detail}</p>
          </div>
        </article>
      ))}
    </HorizontalScroll>
  );
}
