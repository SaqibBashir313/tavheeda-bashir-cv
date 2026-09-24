import { Monitor, Moon, Sun } from 'lucide-react';
import { type ComponentType, memo, useLayoutEffect, useRef } from 'react';

import { DURATION, EASE } from '@/config/animation';
import { useTheme } from '@/features/theme/hooks/useTheme';
import { THEME_MODES, type ThemeMode } from '@/features/theme/store/theme.store';
import { usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/cn';
import { gsap } from '@/lib/gsap';

const MODE_META: Record<ThemeMode, { label: string; Icon: ComponentType<{ className?: string }> }> =
  {
    light: { label: 'Light', Icon: Sun },
    dark: { label: 'Dark', Icon: Moon },
    system: { label: 'System', Icon: Monitor },
  };

/**
 * Three-state theme control.
 *
 * Accessibility: built on real radio inputs inside a fieldset, so arrow-key
 * navigation, focus management and screen-reader announcements come from the
 * platform rather than from hand-rolled `role="radio"` plumbing.
 */
function ThemeToggleComponent({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  const reduced = usePrefersReducedMotion();

  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // Deliberately NOT `useGsapContext`: this tween must animate *from the
  // indicator's current position* on every change. A scoped context reverts
  // inline styles between runs, which would make the pill jump before sliding.
  useLayoutEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;

    const active = list.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) return;

    const next = { x: active.offsetLeft, width: active.offsetWidth };

    if (reduced) {
      gsap.set(indicator, { ...next, autoAlpha: 1 });
      return;
    }

    const tween = gsap.to(indicator, {
      ...next,
      autoAlpha: 1,
      duration: DURATION.sm,
      ease: EASE.outSoft,
      overwrite: 'auto',
    });

    return () => {
      tween.kill();
    };
  }, [mode, reduced]);

  return (
    <fieldset className={cn('m-0 border-0 p-0', className)}>
      <legend className="sr-only">Colour theme</legend>

      <div
        ref={listRef}
        className="relative flex items-center gap-0.5 rounded-full border border-line bg-surface-sunken p-1"
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="invisible absolute top-1 left-0 h-[calc(100%-0.5rem)] rounded-full bg-surface-raised shadow-subtle"
        />

        {THEME_MODES.map((themeMode) => {
          const { label, Icon } = MODE_META[themeMode];
          const isActive = mode === themeMode;

          return (
            <label
              key={themeMode}
              data-active={isActive}
              title={`${label} theme`}
              className={cn(
                'relative z-10 grid size-8 cursor-pointer place-items-center rounded-full',
                'transition-colors duration-200',
                isActive ? 'text-content' : 'text-content-muted hover:text-content-secondary',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-2',
                'has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
              )}
            >
              <input
                type="radio"
                name="theme-mode"
                value={themeMode}
                checked={isActive}
                onChange={() => setMode(themeMode)}
                className="sr-only"
              />
              <Icon className="size-4" />
              <span className="sr-only">{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Memoised: it re-renders only when the theme actually changes. */
export const ThemeToggle = memo(ThemeToggleComponent);
