import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      miniflare: {
        compatibilityDate: '2026-09-03',
        d1Databases: ['RATE_LIMIT_DB'],
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations(path.join(process.cwd(), 'migrations')),
        },
      },
    })),
  ],
  test: {
    include: ['tests/worker/**/*.test.ts'],
    setupFiles: ['tests/worker/apply-migrations.ts'],
  },
});
