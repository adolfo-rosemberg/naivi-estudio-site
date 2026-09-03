import { expect, test } from '@playwright/test';

test('opens a work, closes with Escape and restores focus', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('[data-gallery-trigger]').first();
  await first.focus();
  await first.press('Enter');
  await expect(page.locator('[data-gallery-dialog]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-gallery-dialog]')).toBeHidden();
  await expect(first).toBeFocused();
});

test('removes transform motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const duration = await page.locator('[data-reveal]').first().evaluate((node) => getComputedStyle(node).transitionDuration);
  expect(duration).toBe('0s');
});
