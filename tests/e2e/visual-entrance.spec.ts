import { expect, test } from '@playwright/test';

test('stages the hero copy and logo entrance', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-hero-reveal]')).toHaveCount(5);
  await expect(page.locator('[data-hero-logo]')).toHaveCount(1);
  await expect(page.locator('[data-hero-reveal]').first()).toHaveCSS('animation-name', 'hero-copy-in');
  await expect(page.locator('[data-hero-logo]')).toHaveCSS('animation-name', 'hero-logo-in');
  await expect(page.locator('[data-hero-reveal]').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-hero-logo]')).toHaveCSS('opacity', '1');
});
