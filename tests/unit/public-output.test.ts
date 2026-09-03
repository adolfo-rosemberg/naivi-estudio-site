import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function filesUnder(path: string): string[] {
  return readdirSync(path).flatMap((name) => {
    const current = join(path, name);
    return statSync(current).isDirectory() ? filesUnder(current) : [current];
  });
}

describe('public output', () => {
  it('contains neither direct contact routes nor server secret names', () => {
    const text = filesUnder(join(process.cwd(), 'dist'))
      .filter((file) => /\.(?:html|js|css|json|txt|xml)$/i.test(file))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    expect(text).not.toMatch(/https?:\/\/(?:wa\.me|api\.whatsapp\.com)/i);
    expect(text).not.toContain('WHATSAPP_PHONE');
    expect(text).not.toContain('TURNSTILE_SECRET_KEY');
    expect(text).not.toContain('RATE_LIMIT_HMAC_SECRET');
  });
});
