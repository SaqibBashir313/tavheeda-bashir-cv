import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { type ReactElement, type ReactNode, useState } from 'react';

import { DURATION, EASE } from '@/config/animation';
import { useAnimatedPresence } from '@/hooks';
import { cn } from '@/lib/cn';
import { gsap } from '@/lib/gsap';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
export type TooltipAlign = 'start' | 'center' | 'end';

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  /** Preferred side. Radix flips it automatically if it would overflow. */
  side?: TooltipSide;
  align?: TooltipAlign;
  sideOffset?: number;
  delayDuration?: number;
  showArrow?: boolean;
  /** Render the trigger without a tooltip (e.g. when the label is visible). */
  disabled?: boolean;
  className?: string;
}

/** Entry offset points *away* from the trigger, so the tip appears to emerge from it. */
const ENTRY_OFFSET: Record<TooltipSide, { x?: number; y?: number }> = {
  top: { y: 6 },
  bottom: { y: -6 },
  left: { x: 6 },
  right: { x: -6 },
};

/**
 * Accessible tooltip: Radix owns behaviour, GSAP owns motion.
 *
 * Radix gives us collision-aware positioning (the "smart" part — it flips and
 * shifts to stay in the viewport), hover/focus/Escape handling, the
 * `aria-describedby` wiring, and the single shared open-delay across the app.
 *
 * Motion is ours: `useAnimatedPresence` keeps the node alive through the exit
 * tween by flipping Radix's `forceMount` on, so we get a real fade+scale *out*
 * instead of the node vanishing mid-animation.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 8,
  delayDuration,
  showArrow = true,
  disabled = false,
  className,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { mounted, ref } = useAnimatedPresence<HTMLDivElement>({
    open: isOpen,
    enter: (element) => {
      // Read the side Radix actually chose — it may have flipped ours.
      const resolvedSide = (element.getAttribute('data-side') as TooltipSide | null) ?? side;
      return gsap.fromTo(
        element,
        { autoAlpha: 0, scale: 0.94, ...ENTRY_OFFSET[resolvedSide] },
        {
          autoAlpha: 1,
          scale: 1,
          x: 0,
          y: 0,
          duration: DURATION.xs,
          ease: EASE.outSoft,
        },
      );
    },
    exit: (element, done) =>
      gsap.to(element, {
        autoAlpha: 0,
        scale: 0.97,
        duration: DURATION.instant,
        ease: EASE.inOut,
        onComplete: done,
      }),
  });

  if (disabled) return children;

  return (
    <TooltipPrimitive.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      {...(delayDuration === undefined ? {} : { delayDuration })}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>

      {mounted ? (
        <TooltipPrimitive.Portal forceMount>
          <TooltipPrimitive.Content
            ref={ref}
            side={side}
            align={align}
            sideOffset={sideOffset}
            collisionPadding={12}
            className={cn(
              'z-50 max-w-[16rem] rounded-lg bg-surface-inverted px-2.5 py-1.5',
              'text-xs leading-relaxed font-medium text-content-inverted shadow-popover',
              'will-animate',
              className,
            )}
            // Scale from the edge nearest the trigger, not from the centre.
            style={{ transformOrigin: 'var(--radix-tooltip-content-transform-origin)' }}
          >
            {content}
            {showArrow ? (
              <TooltipPrimitive.Arrow
                className="fill-[var(--surface-inverted)]"
                width={10}
                height={5}
              />
            ) : null}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      ) : null}
    </TooltipPrimitive.Root>
  );
}

/**
 * Mount once, near the app root. Owns the shared delay so the *first* tooltip
 * waits and subsequent ones appear instantly — the behaviour users expect from
 * a toolbar.
 */
export function TooltipProvider({
  children,
  delayDuration = 250,
}: {
  children: ReactNode;
  delayDuration?: number;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={400}>
      {children}
    </TooltipPrimitive.Provider>
  );
}
