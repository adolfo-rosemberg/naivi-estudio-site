import { expect, test } from '@playwright/test';

test('shows the approved services, experience, gallery and contact copy', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Servicios para tu próximo cambio' })).toBeVisible();
  for (const service of ['Tintes', 'Mechas', 'Cortes de cabello', 'Bótox capilar', 'Keratina']) {
    await expect(page.getByText(service, { exact: true })).toBeVisible();
  }
  await expect(page.locator('#servicios [data-service-icon]')).toHaveCount(5);
  await expect(page.locator('#servicios [data-service-icon] svg')).toHaveCount(5);
  await expect(page.locator('#servicios')).toHaveClass(/services--colorful/);
  await expect(page.getByRole('heading', { name: 'Experiencia que se nota en cada detalle' })).toBeVisible();
  await expect(page.getByText('+15 años de experiencia', { exact: true })).toHaveCount(2);
  await expect(page.getByText('Coatzacoalcos, Veracruz', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Una mirada a mis trabajos' })).toBeVisible();
  await expect(page.locator('[data-gallery-trigger]')).toHaveCount(8);
  await expect(page.getByRole('heading', { name: 'Hablemos de tu próximo cambio' })).toBeVisible();
  await expect(page.getByText('Por cita previa', { exact: true })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('921 117 3247');
});
