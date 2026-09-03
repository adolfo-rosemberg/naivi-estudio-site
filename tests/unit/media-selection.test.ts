import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('media selection', () => {
  it('contains eight publishable works and no work 06', () => {
    const root = join(process.cwd(), 'src/assets/gallery');
    const expected = ['01', '02', '03', '04', '05', '07', '08', '09'];
    for (const id of expected) {
      expect(existsSync(join(root, `naivi-trabajo-${id}.webp`))).toBe(true);
    }
    expect(existsSync(join(root, 'naivi-trabajo-06.webp'))).toBe(false);
  });
});
