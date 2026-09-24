import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { type ComponentType, memo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { DURATION, EASE } from '@/config/animation';
import { useToastStore } from '@/features/notifications/store/toast.store';
import type { Toast, ToastVariant } from '@/features/notifications/types';
import { useAnimatedPresence, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/cn';
import { gsap } from '@/lib/gsap';

interface VariantMeta {
  Icon: ComponentType<{ className?: string }>;
  iconClass: string;
  barClass: string;
  /** Errors are announced assertively; everything else politely. */
  role: 'alert' | 'status';
}

const VARIANT_META: Record<ToastVariant, VariantMeta> = {
  success: {
    Icon: CheckCircle2,
    iconClass: 'text-success',
    barClass: 'bg-success',
    role: 'status',
  },
  error: { Icon: XCircle, iconClass: 'text-danger', barClass: 'bg-danger', role: 'alert' },
  warning: {
    Icon: AlertTriangle,
    iconClass: 'text-warning',
    barClass: 'bg-warning',
    role: 'status',
  },
  info: { Icon: Info, iconClass: 'text-info', barClass: 'bg-info', role: 'status' },
};

interface ToastItemProps {
  toast: Toast;
  /** True while the pointer is over the stack or focus is inside it. */
  isPaused: boolean;
}

function ToastItemComponent({ toast, isPaused }: ToastItemProps) {
  const dismiss = useToastStore((state) => state.dismiss);
  const remove = useToastStore((state) => state.remove);
  const reduced = usePrefersReducedMotion();

  const barRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<gsap.core.Tween | null>(null);

  const { Icon, iconClass, barClass, role } = VARIANT_META[toast.variant];

  const handleDismiss = useCallback(() => {
    dismiss(toast.id);
  }, [dismiss, toast.id]);

  const { mounted, ref } = useAnimatedPresence<HTMLLIElement>({
    open: toast.open,
    enter: (element) =>
      gsap.fromTo(
        element,
        { autoAlpha: 0, y: 24, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: DURATION.sm, ease: EASE.outSoft },
      ),
    exit: (element, done) => {
      const timeline = gsap.timeline({ onComplete: done });
      timeline.to(element, {
        autoAlpha: 0,
        x: 36,
        scale: 0.97,
        duration: DURATION.xs,
        ease: EASE.inOut,
      });
      // Collapse the space so the rest of the stack slides up smoothly
      // instead of snapping.
      timeline.to(
        element,
        { height: 0, marginTop: 0, duration: DURATION.xs, ease: EASE.inOut },
        '>-0.06',
      );
      return timeline;
    },
  });

  // Unmount → drop it from the store.
  useEffect(() => {
    if (!mounted) remove(toast.id);
  }, [mounted, remove, toast.id]);

  /**
   * The countdown *is* an animation, so GSAP owns it. One clock drives both
   * the progress bar and the dismissal — they can never disagree, and
   * `pause()`/`resume()` on hover is free.
   */
  useLayoutEffect(() => {
    if (toast.duration <= 0 || !toast.open) return;

    const seconds = toast.duration / 1000;
    const bar = barRef.current;

    timerRef.current =
      reduced || !bar
        ? gsap.delayedCall(seconds, handleDismiss)
        : gsap.to(bar, {
            scaleX: 0,
            duration: seconds,
            ease: 'none',
            onComplete: handleDismiss,
          });

    return () => {
      timerRef.current?.kill();
      timerRef.current = null;
    };
  }, [toast.duration, toast.open, reduced, handleDismiss]);

  useEffect(() => {
    const timer = timerRef.current;
    if (!timer) return;
    if (isPaused) timer.pause();
    else timer.resume();
  }, [isPaused]);

  if (!mounted) return null;

  return (
    <li
      ref={ref}
      role={role}
      // Read the toast as one unit rather than word-by-word as it animates in.
      aria-atomic="true"
      className={cn(
        'pointer-events-auto relative overflow-hidden not-first:mt-3',
        'w-[min(92vw,22rem)] rounded-xl border border-line bg-surface-raised',
        'will-animate p-4 pr-10 shadow-popover',
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('mt-0.5 size-4.5 shrink-0', iconClass)} />

        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold tracking-[-0.01em] text-content">{toast.title}</p>
          {toast.description ? (
            <p className="text-sm leading-relaxed text-content-secondary">{toast.description}</p>
          ) : null}

          {toast.action ? (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                handleDismiss();
              }}
              className="mt-1 text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              {toast.action.label}
            </button>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className={cn(
          'absolute top-2 right-2 grid size-7 place-items-center rounded-full',
          'text-content-muted transition-colors duration-200',
          'hover:bg-surface-sunken hover:text-content',
        )}
      >
        <X className="size-3.5" />
        <span className="sr-only">Dismiss notification</span>
      </button>

      {toast.duration > 0 ? (
        <span
          ref={barRef}
          aria-hidden="true"
          className={cn('absolute inset-x-0 bottom-0 h-0.5 origin-left', barClass)}
        />
      ) : null}
    </li>
  );
}

/**
 * Memoised on `toast` identity: pushing a *new* toast must not re-render or
 * restart the countdown of the ones already on screen.
 */
export const ToastItem = memo(ToastItemComponent);
