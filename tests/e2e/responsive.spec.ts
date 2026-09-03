import { expect, test } from '@playwright/test';

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

test('remains readable when zoomed to 200 percent', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > 0 && document.body.textContent?.includes('Solicitar cotización'))).toBe(true);
});

test('keeps secondary links at a touch-friendly height on a small phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  for (const selector of ['.text-link', '.site-footer a[href="#inicio"]']) {
    await expect(page.locator(selector)).toHaveCSS('min-height', '44px');
    const height = await page.locator(selector).evaluate((node) => node.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(44);
  }
});
