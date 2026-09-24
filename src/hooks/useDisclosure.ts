import { useCallback, useMemo, useState } from 'react';

export interface Disclosure {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

/**
 * Open/closed state for modals, drawers, popovers, accordions.
 * Every callback is stable, so consumers can be `React.memo`'d without the
 * handlers invalidating them on each render.
 */
export function useDisclosure(initial = false): Disclosure {
  const [isOpen, setIsOpen] = useState(initial);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);
  const setOpen = useCallback((value: boolean) => setIsOpen(value), []);

  return useMemo(
    () => ({ isOpen, open, close, toggle, setOpen }),
    [isOpen, open, close, toggle, setOpen],
  );
}
