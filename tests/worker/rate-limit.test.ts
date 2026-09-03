import { beforeEach, describe, expect, it } from 'vitest';
import { env } from 'cloudflare:test';
import { createD1RateLimiter } from '../../src/worker/rate-limit';

const db = env.RATE_LIMIT_DB;

beforeEach(async () => {
  await db.prepare('DELETE FROM contact_attempts').run();
});

describe('D1 contact rate limiter', () => {
  it('admits five of six concurrent attempts for one client', async () => {
    const limiter = createD1RateLimiter(db);
    const results = await Promise.all(
      Array.from({ length: 6 }, () => limiter.reserve('client-hmac', 2_000_000_000)),
    );
    expect(results.filter((result) => result.allowed)).toHaveLength(5);
    expect(results.filter((result) => !result.allowed)).toHaveLength(1);
  });

  it('keeps clients separate and reports a positive retry time', async () => {
    const limiter = createD1RateLimiter(db);
    await Promise.all(Array.from({ length: 5 }, () => limiter.reserve('first-client', 2_000_000_000)));
    const exhausted = await limiter.reserve('first-client', 2_000_000_000);
    expect(exhausted.allowed).toBe(false);
    expect(exhausted.retryAfterSeconds).toBeGreaterThan(0);
    expect((await limiter.reserve('second-client', 2_000_000_000)).allowed).toBe(true);
  });

  it('admits again after the window and deletes expired events', async () => {
    const limiter = createD1RateLimiter(db);
    await Promise.all(Array.from({ length: 5 }, () => limiter.reserve('client-hmac', 2_000_000_000)));
    expect((await limiter.reserve('client-hmac', 2_000_000_601)).allowed).toBe(true);
    const rows = await db.prepare('SELECT COUNT(*) AS count FROM contact_attempts WHERE client_hash = ?1').bind('client-hmac').first<{ count: number }>();
    expect(rows?.count).toBe(1);
  });
});
