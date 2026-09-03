declare module 'cloudflare:test' {
  export const env: import('../../src/worker/types').Env & { TEST_MIGRATIONS: D1Migration[] };
  export function applyD1Migrations(db: D1Database, migrations: D1Migration[], migrationsTableName?: string): Promise<void>;
}
