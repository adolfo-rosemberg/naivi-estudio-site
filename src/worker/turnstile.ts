import type { TurnstileResult } from './types';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileInput {
  secret: string;
  response: string;
  remoteIp?: string;
}

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const failedResult = (errorCodes: string[] = ['verification-failed']): TurnstileResult => ({
  success: false,
  errorCodes,
});

export async function verifyTurnstile(input: TurnstileInput, fetchImpl: FetchLike = fetch): Promise<TurnstileResult> {
  try {
    const body = new URLSearchParams({ secret: input.secret, response: input.response });
    if (input.remoteIp) body.set('remoteip', input.remoteIp);
    const response = await fetchImpl(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) return failedResult(['http-error']);
    const data = (await response.json()) as Record<string, unknown>;
    if (typeof data.success !== 'boolean') return failedResult(['malformed-response']);
    return {
      success: data.success,
      ...(typeof data.hostname === 'string' ? { hostname: data.hostname } : {}),
      ...(typeof data.action === 'string' ? { action: data.action } : {}),
      errorCodes: Array.isArray(data['error-codes'])
        ? data['error-codes'].filter((value): value is string => typeof value === 'string')
        : [],
    };
  } catch {
    return failedResult(['network-error']);
  }
}
