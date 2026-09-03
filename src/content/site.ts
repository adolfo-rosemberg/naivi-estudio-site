import type { ImageMetadata } from 'astro';

import work01 from '../assets/gallery/naivi-trabajo-01.webp';
import work02 from '../assets/gallery/naivi-trabajo-02.webp';
import work03 from '../assets/gallery/naivi-trabajo-03.webp';
import work04 from '../assets/gallery/naivi-trabajo-04.webp';
import work05 from '../assets/gallery/naivi-trabajo-05.webp';
import work07 from '../assets/gallery/naivi-trabajo-07.webp';
import work08 from '../assets/gallery/naivi-trabajo-08.webp';
import work09 from '../assets/gallery/naivi-trabajo-09.webp';

export interface GalleryItem {
  id: string;
  image: ImageMetadata;
  alt: string;
}

export const siteContent = {
  brand: 'Naivi Estudio',
  heroTitle: 'El color que imaginas, pensado para ti',
  experienceLabel: '+15 años de experiencia',
  location: 'Coatzacoalcos, Veracruz',
  schedule: ['Lunes a sábado', '10:00 a 14:00', '17:00 a 20:00', 'Domingo cerrado'],
  services: ['Tintes', 'Mechas', 'Cortes de cabello', 'Bótox capilar', 'Keratina'],
} as const;

export const galleryItems: GalleryItem[] = [
  { id: '07', image: work07, alt: 'Vista posterior de cabello largo en tonos claros y raíz oscura.' },
  { id: '04', image: work04, alt: 'Cabello corto en tono turquesa visto de perfil.' },
  { id: '02', image: work02, alt: 'Vista posterior de corte bob corto y oscuro.' },
  { id: '05', image: work05, alt: 'Cabello largo castaño con secciones claras.' },
  { id: '09', image: work09, alt: 'Corte corto en capas con tonos claros y oscuros, visto de perfil.' },
  { id: '03', image: work03, alt: 'Cabello corto oscuro visto de perfil.' },
  { id: '01', image: work01, alt: 'Vista posterior y lateral de cabello oscuro con secciones claras.' },
  { id: '08', image: work08, alt: 'Cabello largo claro visto de perfil.' },
];
