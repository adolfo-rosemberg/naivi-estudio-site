import { expect, test } from '@playwright/test';

test('highlights the section currently in view', async ({ page }) => {
  await page.goto('/');
  const servicesLink = page.locator('.site-nav a[href="#servicios"]');
  const portfolioLink = page.locator('.site-nav a[href="#portafolio"]');

  await page.locator('#servicios').scrollIntoViewIfNeeded();
  await expect(servicesLink).toHaveClass(/is-active/);
  await expect(servicesLink).toHaveAttribute('aria-current', 'page');

  await page.locator('#portafolio').scrollIntoViewIfNeeded();
  await expect(portfolioLink).toHaveClass(/is-active/);
  await expect(portfolioLink).toHaveAttribute('aria-current', 'page');
  await expect(servicesLink).not.toHaveClass(/is-active/);
});
