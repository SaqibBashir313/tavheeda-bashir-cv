import type { Role } from '@/data/resume';
import { ROLES } from '@/data/resume';
import { sleep } from '@/utils/misc';

/**
 * Feature data source.
 *
 * The CV is static content, so this resolves from `src/data/resume.ts` rather
 * than the network — but it keeps the same async shape as every other feature
 * API. That means the loading and error paths in the UI are real and exercised,
 * and pointing this at a CMS later is a change to this file alone.
 */
export async function fetchRoles(signal?: AbortSignal): Promise<readonly Role[]> {
  await sleep(250, signal);
  return ROLES;
}
