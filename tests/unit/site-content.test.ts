import { describe, expect, it } from 'vitest';
import { galleryItems, siteContent } from '../../src/content/site';

describe('approved public content', () => {
  it('contains only confirmed business details', () => {
    expect(siteContent.experienceLabel).toBe('+15 años de experiencia');
    expect(siteContent.location).toBe('Coatzacoalcos, Veracruz');
    expect(siteContent.services).toEqual([
      'Tintes',
      'Mechas',
      'Cortes de cabello',
      'Bótox capilar',
      'Keratina',
    ]);
    expect(JSON.stringify(siteContent)).not.toMatch(/\b(?:balayage|peinados|dirección exacta)\b/i);
  });

  it('uses the approved gallery order and excludes work 06', () => {
    expect(galleryItems.map((item) => item.id)).toEqual(['07', '04', '02', '05', '09', '03', '01', '08']);
    expect(galleryItems).toHaveLength(8);
    expect(JSON.stringify(galleryItems)).not.toContain('06');
  });
});
