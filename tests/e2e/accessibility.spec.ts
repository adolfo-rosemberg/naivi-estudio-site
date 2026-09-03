import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('has no serious or critical accessibility violations on the page', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(700);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('keeps the open gallery accessible', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(700);
  await page.locator('[data-gallery-trigger]').first().click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});
