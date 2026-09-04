import { expect, test } from '@playwright/test';

test('does not initialize an invalid verification when the public key is missing', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  await page.locator('[data-contact-open]').first().click();
  await expect(page.locator('[data-contact-unavailable]')).toBeVisible();
  await expect(page.locator('form[action="/api/contacto"]')).toHaveCount(0);
  await expect(page.locator('script[data-turnstile-script]')).toHaveCount(0);
  await expect(page.locator('a[href*="wa.me"], a[href*="whatsapp.com"]')).toHaveCount(0);
  expect(consoleErrors.join('\n')).not.toContain('TurnstileError');
});
