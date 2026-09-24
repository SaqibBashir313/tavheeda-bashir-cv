/**
 * Route paths live here as literals, not scattered through JSX.
 * `<Link to={ROUTES.experience} />` cannot typo; `<Link to="/experince" />` can.
 */
export const ROUTES = {
  home: '/',
  experience: '/experience',
  contact: '/contact',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export interface NavItem {
  label: string;
  to: RoutePath;
  description: string;
}

/** Single source of truth for the header, the mobile drawer and the footer. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Overview', to: ROUTES.home, description: 'Summary, expertise and credentials' },
  {
    label: 'Experience',
    to: ROUTES.experience,
    description: 'Roles, contract vehicles and domains',
  },
  { label: 'Contact', to: ROUTES.contact, description: 'Get in touch' },
] as const;
