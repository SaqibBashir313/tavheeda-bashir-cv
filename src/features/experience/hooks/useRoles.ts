import { useCallback } from 'react';

import type { Role } from '@/data/resume';
import { fetchRoles } from '@/features/experience/api/experience.api';
import { useAsync, type UseAsyncResult } from '@/hooks';

/**
 * Components consume this, not `fetchRoles` directly — so swapping the generic
 * `useAsync` for a query library later touches exactly one file.
 */
export function useRoles(): UseAsyncResult<readonly Role[]> {
  const task = useCallback((signal: AbortSignal) => fetchRoles(signal), []);
  return useAsync(task);
}
