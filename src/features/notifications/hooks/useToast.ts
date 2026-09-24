import { toast } from '@/features/notifications/store/toast.store';

/**
 * Convenience accessor for components.
 *
 * It returns the same module-level `toast` object the rest of the app uses, so
 * there is exactly one notification API — no hook-only variant that drifts
 * from the imperative one. The object is a stable reference, so it is safe in
 * dependency arrays and never breaks memoisation.
 */
export function useToast() {
  return toast;
}
