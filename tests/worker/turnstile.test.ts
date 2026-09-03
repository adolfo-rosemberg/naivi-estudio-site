import { describe, expect, it, vi } from 'vitest';
import { verifyTurnstile } from '../../src/worker/turnstile';

describe('Turnstile verification', () => {
  it('returns the represented verification fields', async () => {
    const response = new Response(JSON.stringify({
      success: true,
      hostname: 'naivi.example',
      action: 'contacto_whatsapp',
      'error-codes': [],
      extra: 'ignored',
    }), { status: 200 });
    const result = await verifyTurnstile({ secret: 'secret', response: 'token' }, vi.fn(async () => response));
    expect(result).toEqual({ success: true, hostname: 'naivi.example', action: 'contacto_whatsapp', errorCodes: [] });
  });

  it('converts HTTP, malformed and network failures into verification failure', async () => {
    const httpFailure = await verifyTurnstile({ secret: 'secret', response: 'token' }, vi.fn(async () => new Response('no', { status: 500 })));
    expect(httpFailure.success).toBe(false);

    const malformed = await verifyTurnstile({ secret: 'secret', response: 'token' }, vi.fn(async () => new Response('no', { status: 200 })));
    expect(malformed.success).toBe(false);

    const networkFailure = await verifyTurnstile({ secret: 'secret', response: 'token' }, vi.fn(async () => { throw new Error('offline'); }));
    expect(networkFailure.success).toBe(false);
  });
});
