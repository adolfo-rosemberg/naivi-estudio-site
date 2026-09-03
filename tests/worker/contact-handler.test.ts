import { describe, expect, it, vi } from 'vitest';
import { CONTACT_MESSAGE, TURNSTILE_ACTION } from '../../src/shared/contact';
import { createContactHandler, type ContactHandlerDependencies } from '../../src/worker/contact-handler';
import type { Env, TurnstileResult } from '../../src/worker/types';

const FIXTURE_PHONE = '521000000000';
const ALLOWED_ORIGIN = 'https://naivi.example';
const DEFAULT_RESULT: TurnstileResult = {
  success: true,
  hostname: 'naivi.example',
  action: TURNSTILE_ACTION,
  errorCodes: [],
};

const makeEnv = (overrides: Partial<Env> = {}): Env => ({
  ASSETS: {} as Fetcher,
  RATE_LIMIT_DB: {} as D1Database,
  WHATSAPP_PHONE: FIXTURE_PHONE,
  TURNSTILE_SECRET_KEY: 'secret-fixture',
  RATE_LIMIT_HMAC_SECRET: 'hmac-fixture',
  ALLOWED_ORIGIN,
  TURNSTILE_HOSTNAME: 'naivi.example',
  ...overrides,
});

const makeRequest = (init: RequestInit = {}, body = 'cf-turnstile-response=token-fixture'): Request => {
  const { headers: customHeaders, body: customBody, ...rest } = init;
  const method = String(rest.method ?? 'POST').toUpperCase();
  return new Request(`${ALLOWED_ORIGIN}/api/contacto`, {
    method,
    headers: {
      Origin: ALLOWED_ORIGIN,
      'CF-Connecting-IP': '203.0.113.10',
      'Content-Type': 'application/x-www-form-urlencoded',
      ...customHeaders,
    },
    body: method === 'GET' || method === 'HEAD' ? undefined : customBody === undefined ? body : customBody,
    ...rest,
  });
};

const makeDependencies = (overrides: Partial<ContactHandlerDependencies> = {}): ContactHandlerDependencies => ({
  verifyTurnstile: vi.fn(async () => DEFAULT_RESULT),
  hashClientIp: vi.fn(async () => 'hashed-ip'),
  rateLimiter: { reserve: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 })) },
  now: () => 2_000_000_000,
  ...overrides,
});

describe('contact handler decision table', () => {
  it.each([
    ['non-POST request', () => makeRequest({ method: 'GET', body: undefined }), 405],
    ['absent Origin', () => makeRequest({ headers: { Origin: '' } }), 403],
    ['wrong Origin', () => makeRequest({ headers: { Origin: 'https://other.example' } }), 403],
    ['absent Cloudflare IP', () => makeRequest({ headers: { 'CF-Connecting-IP': '' } }), 400],
    ['missing token', () => makeRequest({}, ''), 400],
    ['body over 4096 bytes', () => makeRequest({}, `cf-turnstile-response=${'x'.repeat(4100)}`), 413],
  ])('rejects %s with status %s', async (_name, requestFactory, expectedStatus) => {
    const handler = createContactHandler(makeDependencies());
    const response = await handler(requestFactory(), makeEnv());
    expect(response.status).toBe(expectedStatus);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it.each([
    ['invalid token', { success: false, errorCodes: ['invalid-input-response'] }],
    ['wrong hostname', { ...DEFAULT_RESULT, hostname: 'other.example' }],
    ['wrong action', { ...DEFAULT_RESULT, action: 'other_action' }],
  ] as const)('rejects %s after verification', async (_name, result) => {
    const handler = createContactHandler(makeDependencies({ verifyTurnstile: vi.fn(async () => result as TurnstileResult) }));
    const response = await handler(makeRequest(), makeEnv());
    expect(response.status).toBe(403);
    expect(response.headers.get('location')).toBeNull();
  });

  it('rejects an exhausted quota with Retry-After', async () => {
    const handler = createContactHandler(
      makeDependencies({ rateLimiter: { reserve: vi.fn(async () => ({ allowed: false, retryAfterSeconds: 42 })) } }),
    );
    const response = await handler(makeRequest(), makeEnv());
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('42');
  });

  it('fails safely when Turnstile or D1 throws', async () => {
    const turnstileHandler = createContactHandler(
      makeDependencies({ verifyTurnstile: vi.fn(async () => { throw new Error('network'); }) }),
    );
    const turnstileResponse = await turnstileHandler(makeRequest(), makeEnv());
    expect(turnstileResponse.status).toBe(503);

    const d1Handler = createContactHandler(
      makeDependencies({ rateLimiter: { reserve: vi.fn(async () => { throw new Error('d1'); }) } }),
    );
    const d1Response = await d1Handler(makeRequest(), makeEnv());
    expect(d1Response.status).toBe(503);
  });

  it('rejects missing configuration before external dependencies', async () => {
    const dependencies = makeDependencies();
    const handler = createContactHandler(dependencies);
    const response = await handler(makeRequest(), makeEnv({ TURNSTILE_SECRET_KEY: '' }));
    expect(response.status).toBe(503);
    expect(dependencies.hashClientIp).not.toHaveBeenCalled();
    expect(dependencies.verifyTurnstile).not.toHaveBeenCalled();
  });

  it('redirects a valid request with the approved message', async () => {
    const handler = createContactHandler(makeDependencies());
    const response = await handler(makeRequest(), makeEnv());
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      `https://wa.me/${FIXTURE_PHONE}?text=${encodeURIComponent(CONTACT_MESSAGE)}`,
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
