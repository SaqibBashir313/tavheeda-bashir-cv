import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

import { ToastItem } from '@/features/notifications/components/ToastItem';
import { selectToasts, useToastStore } from '@/features/notifications/store/toast.store';
import { useEventListener } from '@/hooks';
import { cn } from '@/lib/cn';

/**
 * The stack. Mount exactly once, at the app root.
 *
 * Accessibility contract:
 *  - a labelled `region` so screen-reader users can jump to notifications;
 *  - `aria-live="polite"` on the list, so additions are announced without
 *    interrupting (individual error toasts escalate to `role="alert"`);
 *  - auto-dismiss pauses on hover **and** on focus-within, so a keyboard user
 *    tabbing to the action button never has it disappear mid-reach;
 *  - `Escape` clears the stack.
 *
 * Rendered through a portal so no ancestor's `overflow`, `transform` or
 * `z-index` — of which an animation-heavy page has plenty — can clip it.
 */
export function ToastViewport() {
  const toasts = useToastStore(selectToasts);
  const dismissAll = useToastStore((state) => state.dismissAll);

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && toasts.length > 0) dismissAll();
    },
    [dismissAll, toasts.length],
  );
  useEventListener('keydown', onKeyDown);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="region"
      aria-label="Notifications"
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-end',
        'p-4 sm:p-6',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <ol aria-live="polite" aria-relevant="additions" className="flex w-auto flex-col">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} isPaused={isHovered || isFocused} />
        ))}
      </ol>
    </div>,
    document.body,
  );
}
