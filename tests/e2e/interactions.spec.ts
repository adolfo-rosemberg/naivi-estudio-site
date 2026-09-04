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

test('keeps a uniform crop in the grid and opens the complete photo', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('[data-gallery-trigger]').first();
  const cardBox = await first.boundingBox();
  expect(cardBox).not.toBeNull();
  expect(Math.abs(cardBox!.width - cardBox!.height)).toBeLessThan(1);

  const fullSource = await first.getAttribute('data-gallery-full-src');
  const fullWidth = Number(await first.getAttribute('data-gallery-full-width'));
  const fullHeight = Number(await first.getAttribute('data-gallery-full-height'));
  expect(fullSource).toBeTruthy();
  expect(fullWidth).toBeGreaterThan(0);
  expect(fullHeight).toBeGreaterThan(0);
  expect(fullWidth).not.toBe(fullHeight);

  await first.click();
  const dialogImage = page.locator('[data-gallery-dialog-image]');
  await expect(dialogImage).toHaveAttribute('src', fullSource!);
  await expect
    .poll(() =>
      dialogImage.evaluate((element) => {
        const image = element as HTMLImageElement;
        return image.complete && image.naturalWidth > 0;
      }),
    )
    .toBe(true);

  const naturalSize = await dialogImage.evaluate((element) => {
    const image = element as HTMLImageElement;
    return { width: image.naturalWidth, height: image.naturalHeight };
  });
  expect(naturalSize.width / naturalSize.height).toBeCloseTo(fullWidth / fullHeight, 2);
});

test('uses the available dialog width for the complete photo on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('[data-gallery-trigger]').first().click();

  const dialogBox = await page.locator('[data-gallery-dialog]').boundingBox();
  const imageBox = await page.locator('[data-gallery-dialog-image]').boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(imageBox).not.toBeNull();
  expect(imageBox!.width / dialogBox!.width).toBeGreaterThan(0.75);
});

test('removes transform motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const duration = await page.locator('[data-reveal]').first().evaluate((node) => getComputedStyle(node).transitionDuration);
  expect(duration).toBe('0s');
});
