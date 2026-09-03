/// <reference types="@cloudflare/vitest-plugin/types/cloudflare-test" />

import type { Env } from '../../src/worker/types';

declare module 'cloudflare:test' {
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: D1Migration[];
  }
}
