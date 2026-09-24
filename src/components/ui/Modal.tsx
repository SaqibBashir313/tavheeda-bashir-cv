import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type ReactNode, useRef } from 'react';

import { DURATION, EASE } from '@/config/animation';
import { useAnimatedPresence, useReturnFocus } from '@/hooks';
import { cn } from '@/lib/cn';
import { gsap } from '@/lib/gsap';

const SIZES = {
  sm: 'w-[min(92vw,26rem)]',
  md: 'w-[min(92vw,34rem)]',
  lg: 'w-[min(92vw,48rem)]',
} as const;

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required for accessibility. Pass `hideTitle` if it must be visually absent. */
  title: string;
  description?: string;
  hideTitle?: boolean;
  size?: keyof typeof SIZES;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Modal = Radix Dialog (focus trap, scroll lock, Escape, `aria-modal`)
 * + our `useAnimatedPresence` choreography.
 *
 * Layout note: the panel is centred with `inset-0 m-auto`, not
 * `top-1/2 -translate-y-1/2`. GSAP writes the `transform` property wholesale,
 * so a translate-based centring technique would be wiped out the moment we
 * tween `scale` — a bug worth designing around once, here.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  hideTitle = false,
  size = 'md',
  children,
  footer,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  // Controlled dialogs have no Radix Trigger, so focus restoration is ours.
  const onCloseAutoFocus = useReturnFocus();

  const { mounted, ref } = useAnimatedPresence<HTMLDivElement>({
    open,
    enter: (panel) => {
      const timeline = gsap.timeline();
      if (overlayRef.current) {
        timeline.fromTo(
          overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: DURATION.xs, ease: EASE.inOut },
          0,
        );
      }
      timeline.fromTo(
        panel,
        { autoAlpha: 0, scale: 0.97, y: 14 },
        { autoAlpha: 1, scale: 1, y: 0, duration: DURATION.sm, ease: EASE.outSoft },
        0,
      );
      return timeline;
    },
    exit: (panel, done) => {
      const timeline = gsap.timeline({ onComplete: done });
      timeline.to(
        panel,
        { autoAlpha: 0, scale: 0.98, y: 8, duration: DURATION.xs, ease: EASE.inOut },
        0,
      );
      if (overlayRef.current) {
        timeline.to(overlayRef.current, { autoAlpha: 0, duration: DURATION.xs }, 0);
      }
      return timeline;
    },
  });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {mounted ? (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay
            ref={overlayRef}
            className="fixed inset-0 z-50 bg-surface-overlay backdrop-blur-[2px]"
          />

          <DialogPrimitive.Content
            ref={ref}
            onCloseAutoFocus={onCloseAutoFocus}
            // Radix warns when a Dialog has no Description; opting out
            // explicitly is the documented way to say "this one needs none".
            {...(description ? {} : { 'aria-describedby': undefined })}
            className={cn(
              'fixed inset-0 z-50 m-auto h-fit max-h-[85dvh] overflow-y-auto',
              'rounded-2xl border border-line bg-surface-raised p-6 shadow-modal',
              'will-animate',
              SIZES[size],
              className,
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                {hideTitle ? (
                  <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
                ) : (
                  <DialogPrimitive.Title className="text-lg font-semibold tracking-[-0.015em]">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description ? (
                  <DialogPrimitive.Description className="text-sm text-content-secondary">
                    {description}
                  </DialogPrimitive.Description>
                ) : null}
              </div>

              <DialogPrimitive.Close
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full text-content-muted',
                  'transition-colors duration-200 hover:bg-surface-sunken hover:text-content',
                )}
              >
                <X className="size-4" />
                <span className="sr-only">Close dialog</span>
              </DialogPrimitive.Close>
            </div>

            {children ? <div className="mt-5">{children}</div> : null}
            {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      ) : null}
    </DialogPrimitive.Root>
  );
}
