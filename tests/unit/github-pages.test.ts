import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const originalGitHubActions = process.env.GITHUB_ACTIONS;

afterEach(() => {
  if (originalGitHubActions === undefined) delete process.env.GITHUB_ACTIONS;
  else process.env.GITHUB_ACTIONS = originalGitHubActions;
  vi.resetModules();
});

describe('GitHub Pages deployment', () => {
  it('uses the repository subdirectory only during GitHub Actions builds', async () => {
    process.env.GITHUB_ACTIONS = 'true';
    vi.resetModules();

    const { default: config } = await import('../../astro.config.mjs');

    expect(config).toMatchObject({
      site: 'https://adolfo-rosemberg.github.io',
      base: '/naivi-estudio-site',
    });
  });

  it('publishes the temporary preview with the official Pages actions', () => {
    const workflow = readFileSync(
      join(process.cwd(), '.github', 'workflows', 'deploy.yml'),
      'utf8',
    );

    expect(workflow).toContain('uses: withastro/action@v5');
    expect(workflow).toContain('uses: actions/deploy-pages@v4');
    expect(workflow).toContain("PUBLIC_PREVIEW_ONLY: 'true'");
  });
});
