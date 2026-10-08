import { PROFILE } from '@/data/resume';

/**
 * Site-level metadata, derived entirely from the CV data in
 * `src/data/resume.ts`. Nothing is duplicated or invented here.
 */
export const SITE = {
  name: PROFILE.fullName,
  shortName: PROFILE.initials,
  role: PROFILE.title,
  tagline: PROFILE.headline,
  description: PROFILE.headline,
  email: PROFILE.email,
  phone: PROFILE.phone,
  location: PROFILE.location,
  social: [{ label: 'LinkedIn', href: PROFILE.linkedin }],
  footerNote: `© ${String(new Date().getFullYear())} ${PROFILE.fullName}. ${PROFILE.title}.`,
} as const;
