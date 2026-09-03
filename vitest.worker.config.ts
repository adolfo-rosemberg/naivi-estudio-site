import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      miniflare: { compatibilityDate: '2026-09-03' },
    })),
  ],
  test: {
    include: ['tests/worker/**/*.test.ts'],
  },
});
