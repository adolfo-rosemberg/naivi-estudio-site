import { describe, expect, it } from 'vitest';
import {
  CONTACT_MESSAGE,
  CONTACT_PATH,
  RATE_LIMIT_POLICY,
  TURNSTILE_ACTION,
} from '../../src/shared/contact';

describe('contact contract', () => {
  it('keeps the approved copy and limits in one shared contract', () => {
    expect(CONTACT_PATH).toBe('/api/contacto');
    expect(CONTACT_MESSAGE).toBe('Hola, me gustaría cotizar un servicio y una cita');
    expect(TURNSTILE_ACTION).toBe('contacto_whatsapp');
    expect(RATE_LIMIT_POLICY).toEqual({ maxAttempts: 5, windowSeconds: 600 });
  });
});
