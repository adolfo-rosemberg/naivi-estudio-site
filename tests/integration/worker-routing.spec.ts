import { expect, test } from '@playwright/test';

test('serves the static page with security headers', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-frame-options']).toBe('DENY');
  expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

test('routes contact requests to the Worker without a destination', async ({ request }) => {
  const response = await request.post('/api/contacto', {
    headers: {
      Origin: 'http://127.0.0.1:8787',
      'CF-Connecting-IP': '127.0.0.1',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: 'cf-turnstile-response=local-fixture',
  });
  expect(response.status()).toBe(503);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(response.headers()['location']).toBeUndefined();
});
