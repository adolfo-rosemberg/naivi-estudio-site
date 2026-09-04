// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig(
  isGitHubPages
    ? {
        site: 'https://adolfo-rosemberg.github.io',
        base: '/naivi-estudio-site',
      }
    : {},
);
