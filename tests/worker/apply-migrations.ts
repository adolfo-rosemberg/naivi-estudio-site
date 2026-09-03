import { applyD1Migrations, env } from 'cloudflare:test';

await applyD1Migrations(env.RATE_LIMIT_DB, env.TEST_MIGRATIONS);
