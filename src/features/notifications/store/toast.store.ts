import { TOAST_DEFAULTS } from '@/config/constants';
import type { Toast, ToastInput, ToastVariant } from '@/features/notifications/types';
import { createStore } from '@/store/createStore';
import { createId } from '@/utils/id';

interface ToastState {
  toasts: Toast[];
  /** Adds (or updates, when `id` is reused) a toast. Returns its id. */
  push: (input: ToastInput) => string;
  /** Begins the exit animation. The item calls `remove` when it finishes. */
  dismiss: (id: string) => void;
  remove: (id: string) => void;
  dismissAll: () => void;
}

function resolveDuration(variant: ToastVariant, duration?: number): number {
  if (duration !== undefined) return duration;
  return TOAST_DEFAULTS.durationByVariant[variant] ?? TOAST_DEFAULTS.duration;
}

/**
 * Toast state is a queue, not a component tree.
 *
 * Keeping it in a store is what makes `toast.success(...)` callable from
 * anywhere — an API interceptor, a Zustand action, an event handler — with no
 * provider, no prop drilling and no context gymnastics.
 *
 * Note there are no timers here: each `<ToastItem />` owns its own countdown
 * as a GSAP tween, so the visible progress bar and the dismissal are the same
 * clock and cannot drift apart (and pause together on hover).
 */
export const useToastStore = createStore<ToastState>('toasts', (set, get) => ({
  toasts: [],

  push: (input) => {
    const variant = input.variant ?? 'info';
    const id = input.id ?? createId('toast');

    const toast: Toast = {
      id,
      variant,
      title: input.title,
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.action === undefined ? {} : { action: input.action }),
      duration: resolveDuration(variant, input.duration),
      open: true,
    };

    set(
      (state) => {
        const existingIndex = state.toasts.findIndex((item) => item.id === id);

        if (existingIndex >= 0) {
          const toasts = [...state.toasts];
          toasts[existingIndex] = toast;
          return { toasts };
        }

        // Evict the oldest once the stack is full, so the screen never fills
        // up with notifications the user has stopped reading.
        const trimmed =
          state.toasts.length >= TOAST_DEFAULTS.limit
            ? state.toasts.slice(state.toasts.length - TOAST_DEFAULTS.limit + 1)
            : state.toasts;

        return { toasts: [...trimmed, toast] };
      },
      false,
      `toasts/push:${variant}`,
    );

    return id;
  },

  dismiss: (id) =>
    set(
      (state) => ({
        toasts: state.toasts.map((toast) => (toast.id === id ? { ...toast, open: false } : toast)),
      }),
      false,
      'toasts/dismiss',
    ),

  remove: (id) =>
    set(
      (state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }),
      false,
      'toasts/remove',
    ),

  dismissAll: () => {
    get().toasts.forEach((toast) => {
      get().dismiss(toast.id);
    });
  },
}));

export const selectToasts = (state: ToastState) => state.toasts;

/**
 * Imperative façade — the public API.
 *
 * `toast.success('Saved')` works inside components *and* outside React
 * (services, stores, event listeners) because it reads the store directly
 * rather than through a hook.
 */
function pushVariant(variant: ToastVariant) {
  return (title: string, options: Omit<ToastInput, 'title' | 'variant'> = {}) =>
    useToastStore.getState().push({ ...options, title, variant });
}

export const toast = {
  success: pushVariant('success'),
  error: pushVariant('error'),
  warning: pushVariant('warning'),
  info: pushVariant('info'),
  custom: (input: ToastInput) => useToastStore.getState().push(input),
  dismiss: (id: string) => {
    useToastStore.getState().dismiss(id);
  },
  dismissAll: () => {
    useToastStore.getState().dismissAll();
  },
};
