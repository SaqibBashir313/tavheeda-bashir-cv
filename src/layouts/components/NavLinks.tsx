import { NavLink } from 'react-router';

import { NAV_ITEMS } from '@/config/routes';
import { cn } from '@/lib/cn';

interface NavLinksProps {
  orientation?: 'horizontal' | 'vertical';
  onNavigate?: () => void;
  className?: string;
}

/**
 * Rendered from `NAV_ITEMS`, shared by the desktop header and the mobile
 * drawer. Adding a page means editing `config/routes.ts` — one place, and the
 * router, header, drawer and footer all pick it up.
 */
export function NavLinks({ orientation = 'horizontal', onNavigate, className }: NavLinksProps) {
  return (
    <ul
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'items-center gap-1' : 'flex-col gap-1',
        className,
      )}
    >
      {NAV_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            onClick={onNavigate}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'relative block rounded-full px-4 py-2 text-sm font-medium',
                'transition-colors duration-200 ease-[var(--ease-out-soft)]',
                orientation === 'vertical' && 'px-0 py-3 text-lg',
                isActive ? 'text-content' : 'text-content-muted hover:text-content-secondary',
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.label}
                {/* Underline marker — cheap CSS transition, no layout shift. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-4 -bottom-px h-px origin-center bg-brand',
                    'transition-transform duration-300 ease-[var(--ease-out-soft)]',
                    orientation === 'vertical' && 'inset-x-0',
                    isActive ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
