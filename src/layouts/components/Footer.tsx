import { Link } from 'react-router';

import { Container } from '@/components/common/Container';
import { NAV_ITEMS } from '@/config/routes';
import { SITE } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-sunken">
      <Container className="flex flex-col gap-10 py-14 sm:py-16">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-xs space-y-3">
            <p className="text-sm font-semibold tracking-[-0.015em]">{SITE.name}</p>
            <p className="text-sm leading-relaxed text-content-muted">{SITE.description}</p>
          </div>

          <div className="flex gap-14">
            <nav aria-label="Footer">
              <p className="mb-3 text-xs font-medium tracking-wide text-content-muted uppercase">
                Pages
              </p>
              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sm text-content-secondary transition-colors duration-200 hover:text-content"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="mb-3 text-xs font-medium tracking-wide text-content-muted uppercase">
                Elsewhere
              </p>
              <ul className="space-y-2">
                {SITE.social.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-content-secondary transition-colors duration-200 hover:text-content"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="text-xs text-content-muted">{SITE.footerNote}</p>
      </Container>
    </footer>
  );
}
