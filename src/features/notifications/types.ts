export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  /** Milliseconds until auto-dismiss. `0` means "stays until dismissed". */
  duration: number;
  action?: ToastAction;
  /**
   * `true` while the toast should be on screen. Flipping this to `false` is
   * what starts the exit animation — the item removes itself from the store
   * only once that animation finishes.
   */
  open: boolean;
}

/** What callers provide. Everything else is defaulted by the store. */
export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
  /**
   * Supply a stable id to deduplicate: calling again with the same id
   * updates the existing toast instead of stacking a copy.
   */
  id?: string;
}
