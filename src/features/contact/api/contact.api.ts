import { env } from '@/config/env';
import { api, ENDPOINTS } from '@/services';
import { sleep } from '@/utils/misc';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  id: string;
  receivedAt: string;
}

export async function submitContact(
  payload: ContactPayload,
  signal?: AbortSignal,
): Promise<ContactResponse> {
  if (env.features.mockApi) {
    await sleep(900, signal);
    // Deterministic failure path so the error branch is testable by hand.
    if (payload.email.endsWith('@fail.test')) {
      throw new Error('Our mail relay rejected that address. Try another.');
    }
    return { id: 'mock-submission', receivedAt: new Date().toISOString() };
  }

  return api.post<ContactResponse>(ENDPOINTS.contact.submit, payload, {
    ...(signal ? { signal } : {}),
  });
}
