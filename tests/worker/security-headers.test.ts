import { describe, expect, it } from 'vitest';
import { hashClientIp, withSecurityHeaders } from '../../src/worker/security';

describe('contact security headers', () => {
  it('adds browser protections while preserving no-store', () => {
    const response = withSecurityHeaders(new Response('ok', { headers: { 'cache-control': 'no-store' } }));
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('permissions-policy')).toContain('camera=()');
    expect(response.headers.get('content-security-policy')).toContain('https://challenges.cloudflare.com');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('hashes IP values into a fixed lowercase HMAC representation', async () => {
    const first = await hashClientIp('203.0.113.10', 'secret-fixture');
    const second = await hashClientIp('203.0.113.11', 'secret-fixture');
    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(second).toMatch(/^[0-9a-f]{64}$/);
    expect(second).not.toBe(first);
  });
});
