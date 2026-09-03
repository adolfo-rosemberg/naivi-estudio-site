import { RATE_LIMIT_POLICY } from '../shared/contact';
import type { RateLimiter } from './types';

interface AttemptRow {
  id: number;
}

interface OldestRow {
  oldest: number | null;
}

export function createD1RateLimiter(db: D1Database): RateLimiter {
  return {
    async reserve(clientHash, nowSeconds) {
      const cutoff = nowSeconds - RATE_LIMIT_POLICY.windowSeconds;
      await db.prepare('DELETE FROM contact_attempts WHERE attempted_at <= ?1').bind(cutoff).run();
      const inserted = await db
        .prepare(
          `INSERT INTO contact_attempts (client_hash, attempted_at)
           SELECT ?1, ?2
           WHERE (
             SELECT COUNT(*)
             FROM contact_attempts
             WHERE client_hash = ?1 AND attempted_at > ?3
           ) < ?4
           RETURNING id;`,
        )
        .bind(clientHash, nowSeconds, cutoff, RATE_LIMIT_POLICY.maxAttempts)
        .first<AttemptRow>();

      if (inserted?.id !== undefined) return { allowed: true, retryAfterSeconds: 0 };

      const oldest = await db
        .prepare('SELECT MIN(attempted_at) AS oldest FROM contact_attempts WHERE client_hash = ?1 AND attempted_at > ?2')
        .bind(clientHash, cutoff)
        .first<OldestRow>();
      const retryAfterSeconds = oldest?.oldest === null || oldest?.oldest === undefined
        ? RATE_LIMIT_POLICY.windowSeconds
        : Math.max(1, oldest.oldest + RATE_LIMIT_POLICY.windowSeconds - nowSeconds);
      return { allowed: false, retryAfterSeconds };
    },
  };
}
