import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns focus to whatever opened a dialog, when that dialog closes.
 *
 * ## Why this is needed
 *
 * Radix restores focus on close by calling `context.triggerRef.current?.focus()`
 * — but only a `<Dialog.Trigger>` populates `triggerRef`. Our `<Modal>` and
 * `<MobileNav>` are *controlled* (`open` + `onOpenChange`), opened by an
 * arbitrary button elsewhere in the tree, so `triggerRef` is `null`. Radix's
 * internal handler still calls `event.preventDefault()`, which also suppresses
 * `FocusScope`'s own fallback — so focus lands on `<body>` and a keyboard user
 * is dumped back to the top of the document.
 *
 * Verified in a headless browser: opening and Escaping the dialog left
 * `document.activeElement === document.body`. Nothing in the type system or the
 * linter can see this; only actually tabbing around finds it.
 *
 * ## How it works
 *
 * A capture-phase `focusin` listener remembers the last element focused
 * *outside* any dialog. Anything inside `[role="dialog"]`, and `<body>` itself,
 * is ignored — so the value survives the dialog's own focus trap and the
 * moment of unmount. The returned handler goes straight to
 * `onCloseAutoFocus`, pre-empting Radix's broken path.
 *
 * Shared by every controlled dialog surface, so the fix exists once.
 */
export function useReturnFocus(): (event: Event) => void {
  const lastOutsideFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      // `<body>` receives focus when the focused node is removed; remembering
      // it would overwrite the real trigger during the exit animation.
      if (target === document.body) return;
      if (target.closest('[role="dialog"]')) return;
      lastOutsideFocus.current = target;
    };

    document.addEventListener('focusin', onFocusIn, true);
    return () => document.removeEventListener('focusin', onFocusIn, true);
  }, []);

  // Reads only refs, so an empty dependency list is correct, not a shortcut.
  return useCallback((event: Event) => {
    const target = lastOutsideFocus.current;
    // Nothing worth restoring: let Radix's default behaviour run rather than
    // stealing focus to somewhere arbitrary.
    if (!target?.isConnected) return;
    event.preventDefault();
    target.focus();
  }, []);
}
