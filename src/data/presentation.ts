import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Brain,
  ClipboardCheck,
  FileSearch,
  FileText,
  Flag,
  Layers,
  PenLine,
  SearchCheck,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';

import { CONTRACT_VEHICLES, PROFILE } from '@/data/resume';

/**
 * Editorial groupings for the marketing-style sections (Services, Process,
 * Why Choose Us, final CTA). Every fact here traces back to `resume.ts` —
 * nothing is invented. What's new is the framing: CV bullets grouped into
 * service categories, lifecycle steps, and value props, the way a consulting
 * site presents the same real work.
 */

export interface Service {
  title: string;
  description: string;
  /** Exact `CORE_SKILLS` entries this service groups — the source of truth. */
  skills: readonly string[];
  icon: LucideIcon;
}

/** Every `CORE_SKILLS` item appears in exactly one group below. */
export const SERVICES: readonly Service[] = [
  {
    title: 'Proposal Management & Development',
    description:
      'End-to-end ownership of the proposal lifecycle, from solicitation analysis through final submission.',
    skills: ['Proposal Management & End-to-End Proposal Development', 'RFP/RFQ/RFI & Solicitation Analysis'],
    icon: FileText,
  },
  {
    title: 'Capture & Business Development',
    description: 'Capture management and opportunity qualification that turn a pipeline into a pursuit.',
    skills: [
      'Capture Management',
      'Capture & Business Development Support',
      'Go/No-Go Analysis & Opportunity Qualification',
    ],
    icon: Target,
  },
  {
    title: 'Compliance & Win Strategy',
    description: 'Compliance management, win themes, and competitive analysis built into every response.',
    skills: ['Proposal Strategy & Compliance Management', 'Win Themes & Competitive Analysis'],
    icon: ShieldCheck,
  },
  {
    title: 'Technical & Management Writing',
    description:
      'Executive summaries, management approaches, staffing plans, and the other volumes a proposal lives or dies on.',
    skills: ['Technical & Management Proposal Writing'],
    icon: PenLine,
  },
  {
    title: 'Federal Contract Vehicles',
    description: `Experience across IDIQs, GWACs, BPAs, and task orders — including ${CONTRACT_VEHICLES.slice(0, 3)
      .map((v) => v.name)
      .join(', ')}, and more.`,
    skills: ['Federal, State & Local Government Proposals', 'IDIQs, GWACs, BPAs & Task Orders'],
    icon: Layers,
  },
  {
    title: 'Team Leadership & AI-Assisted Delivery',
    description: 'SME coordination and resource management, with AI-assisted workflows under human oversight.',
    skills: [
      'Team Leadership & SME Coordination',
      'Resource Management & Stakeholder Management',
      'AI-Assisted Proposal Development',
    ],
    icon: Brain,
  },
];

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * The proposal lifecycle as it actually runs across her role history —
 * condensed from the repeating pattern in `ROLES[].highlights` (analysis →
 * Go/No-Go → outline/compliance → writing → color team review → submission).
 */
export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    step: '01',
    title: 'Analyze',
    description:
      'Solicitations are broken down for requirements, risks, evaluation factors, and customer objectives.',
    icon: FileSearch,
  },
  {
    step: '02',
    title: 'Qualify',
    description: 'Go/No-Go assessments and understanding documents turn a lead into a committed pursuit.',
    icon: SearchCheck,
  },
  {
    step: '03',
    title: 'Plan & Outline',
    description: 'Compliance matrices, response outlines, and proposal schedules set the structure before a word is written.',
    icon: ClipboardCheck,
  },
  {
    step: '04',
    title: 'Write & Produce',
    description:
      'Executive summaries, management approaches, staffing plans, and past performance are drafted, edited, and produced to spec.',
    icon: PenLine,
  },
  {
    step: '05',
    title: 'Review',
    description: 'Color team reviews bring SME and leadership feedback in before anything goes final.',
    icon: Users,
  },
  {
    step: '06',
    title: 'Submit & Improve',
    description:
      'A final compliance check precedes submission; post-submission reviews feed lessons learned into the next pursuit.',
    icon: Flag,
  },
];

export interface ValueProp {
  title: string;
  description: string;
  icon: LucideIcon;
}

/** Every claim here is already stated elsewhere on the site — see `HIGHLIGHTS`, `CERTIFICATIONS`, `CONTRACT_VEHICLES`. */
export const WHY_CHOOSE_US: readonly ValueProp[] = [
  {
    title: 'Certified & proven',
    description:
      'APMP Certified with 6+ years of end-to-end proposal development across federal, state/local, and commercial markets.',
    icon: BadgeCheck,
  },
  {
    title: 'Built for compliance',
    description:
      '100% compliance target on response delivery, backed by structured compliance matrices and color-team reviews at every stage.',
    icon: ShieldCheck,
  },
  {
    title: 'Leads, not just writes',
    description: 'Has led and mentored a 4+ member proposal team through complex, multi-stakeholder pursuits.',
    icon: Users,
  },
  {
    title: 'Vehicle-fluent',
    description: `Hands-on experience across ${CONTRACT_VEHICLES.slice(0, 4)
      .map((v) => v.name)
      .join(', ')}, and more.`,
    icon: Layers,
  },
];

export const FINAL_CTA = {
  eyebrow: 'Start a pursuit',
  title: 'Ready for a proposal that reads like it was built to win?',
  description: PROFILE.headline,
} as const;
