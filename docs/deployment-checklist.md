# Checklist de publicación

Esta lista describe una futura publicación. No contiene credenciales ni se ejecuta como parte del
desarrollo local.

## Requisitos que debe confirmar la persona responsable

- Dominio u origen público aprobado.
- Acceso autorizado a la cuenta de Cloudflare.
- Clave pública de Turnstile para el origen aprobado.
- Clave secreta de Turnstile.
- Destino de WhatsApp confirmado.
- Base D1 creada para las cuotas de contacto.
- Autorización para publicar cada fotografía seleccionada.
- Información de privacidad revisada para los servicios reales.

## Nombres de configuración

Configura estos nombres únicamente en el entorno correspondiente y sin incluirlos en el HTML
público:

`PUBLIC_TURNSTILE_SITE_KEY`, `WHATSAPP_PHONE`, `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_HMAC_SECRET`,
`ALLOWED_ORIGIN`, `TURNSTILE_HOSTNAME` y `RATE_LIMIT_DB`.

## Secuencia posterior, sin ejecutar aquí

```powershell
npx wrangler login
npx wrangler d1 create naivi-contact-rate-limit
npx wrangler d1 migrations apply naivi-contact-rate-limit --remote
npx wrangler secret put WHATSAPP_PHONE
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put RATE_LIMIT_HMAC_SECRET
npx wrangler deploy
```

Antes de ejecutar esa secuencia, la sesión de publicación debe leer la documentación vigente de
Cloudflare, sustituir el identificador real de D1 y configurar el origen aprobado. Después debe
hacer una comprobación en seco, verificar Turnstile con el hostname final y solicitar autorización
separada inmediatamente antes de publicar.

La configuración local `wrangler.local.jsonc` usa un identificador ficticio de D1 para pruebas y no
debe reutilizarse como configuración de producción.
