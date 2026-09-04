import { expect, test } from '@playwright/test';

test('shows a safe contact notice in the temporary Pages preview', async ({ page }) => {
  test.skip(process.env.PAGES_PREVIEW_TEST !== 'true', 'Only runs against the temporary Pages build.');

  await page.goto('/');
  await page.locator('[data-contact-open]').first().click();

  await expect(page.getByText('Esta es una vista temporal del sitio.')).toBeVisible();
  await expect(page.locator('script[data-turnstile-script]')).toHaveCount(0);
  await expect(page.locator('form[action="/api/contacto"]')).toHaveCount(0);
});
