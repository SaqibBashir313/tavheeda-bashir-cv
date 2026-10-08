import { Link } from 'react-router';

import { Container } from '@/components/common/Container';
import { Reveal, StaggerGroup } from '@/components/motion/Reveal';
import { NAV_ITEMS } from '@/config/routes';
import { SITE } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-sunken">
      <Container className="flex flex-col gap-12 py-20 sm:py-24">
        <StaggerGroup
          as="div"
          itemSelector="[data-footer-col]"
          preset="fade-up"
          className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between"
        >
          <div data-footer-col className="max-w-xs space-y-4">
            <Reveal preset="fade-up">
              <p className="font-display text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
                {SITE.name}
              </p>
            </Reveal>
            <p className="text-sm leading-relaxed text-content-muted">{SITE.description}</p>
          </div>

          <nav data-footer-col aria-label="Footer">
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

          <div data-footer-col>
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
        </StaggerGroup>

        <p className="text-xs text-content-muted">{SITE.footerNote}</p>
      </Container>
    </footer>
  );
}
