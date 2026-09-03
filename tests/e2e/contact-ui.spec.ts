import { expect, test } from '@playwright/test';

test('opens the protected contact and submits only to the local endpoint', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-contact-open]').first().click();
  const form = page.locator('form[action="/api/contacto"]');
  await expect(form).toBeVisible();
  await expect(form.locator('.cf-turnstile[data-action="contacto_whatsapp"]')).toHaveCount(1);
  await expect(page.locator('a[href*="wa.me"], a[href*="whatsapp.com"]')).toHaveCount(0);
});
