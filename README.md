# Naivi Estudio

Landing page local para Naivi Estudio, estilista especializada en tintes y colorimetría en
Coatzacoalcos, Veracruz. La atención es en casa y únicamente con cita previa.

## Requisitos

- Node.js 22.12 o superior.
- npm incluido con Node.js.

## Uso local

Desde esta carpeta:

```powershell
npm ci
npm run dev
```

`npm run dev` inicia la vista visual de Astro en `http://localhost:4321`.

Para comprobar el proyecto:

```powershell
npm run check
npm run build
npm run test:unit
npm run test:worker
npm run test:e2e
npm run test:integration
```

`npm run test:e2e` compila la salida estática y ejecuta las pruebas de Chromium sobre el diseño,
la galería, el diálogo de contacto, el teclado, el movimiento reducido y los distintos anchos.
`npm run test:integration` aplica la migración D1 local e integra la salida de Astro con el Worker
local mediante Wrangler. No crea recursos remotos.

También puedes ejecutar `npm run preview:worker` después de `npm run build` y
`npm run db:local` para abrir la variante local con la ruta protegida `/api/contacto`.

## Privacidad del contacto

El paquete público no contiene el destino de WhatsApp. El navegador envía únicamente el formulario
local a `/api/contacto`; después de completar la verificación, el Worker genera la redirección para
esa visitante. El número se configura únicamente como secreto del Worker en una futura publicación.

La página muestra Coatzacoalcos, Veracruz y comparte la ubicación exacta solo al confirmar la cita.
No incluye precios, nombres de cursos ni una dirección pública.

## Contenido y activos

La fuente de contenido público está en `src/content/site.ts`. La galería usa ocho trabajos aprobados
en el orden 7, 4, 2, 5, 9, 3, 1 y 8. El trabajo 6 queda fuera. Los logotipos seleccionados están
en `src/assets/brand/`.

Para los requisitos previos de publicación, consulta
[`docs/deployment-checklist.md`](docs/deployment-checklist.md).
