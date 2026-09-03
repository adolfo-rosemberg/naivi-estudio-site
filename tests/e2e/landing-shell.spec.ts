import { expect, test } from '@playwright/test';

test('renders the approved hero and a readable mobile shell', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('El color que imaginas, pensado para ti');
  await expect(page.locator('.hero__experience')).toHaveText('+15 años de experiencia');
  const bodySize = await page.locator('body').evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
  expect(bodySize).toBeGreaterThanOrEqual(16);
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflows).toBe(false);
});
