import { CONTACT_MESSAGE, CONTACT_PATH, RATE_LIMIT_POLICY, TURNSTILE_ACTION } from '../shared/contact';
import { hashClientIp } from './security';
import { verifyTurnstile } from './turnstile';
import type { Env, RateLimiter, TurnstileResult } from './types';

export interface ContactHandlerDependencies {
  verifyTurnstile: (input: { secret: string; response: string; remoteIp?: string }) => Promise<TurnstileResult>;
  hashClientIp: (ip: string, secret: string) => Promise<string>;
  rateLimiter: RateLimiter;
  now: () => number;
}

const REQUIRED_CONFIG: (keyof Env)[] = [
  'WHATSAPP_PHONE',
  'TURNSTILE_SECRET_KEY',
  'RATE_LIMIT_HMAC_SECRET',
  'ALLOWED_ORIGIN',
  'TURNSTILE_HOSTNAME',
];

const headers = (extra: HeadersInit = {}) => new Headers({ 'cache-control': 'no-store', ...extra });

const errorResponse = (status: number, title: string, message: string, extra: HeadersInit = {}) =>
  new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title></head><body><main><h1>${title}</h1><p>${message}</p><a href="/#contacto">Volver al contacto</a></main></body></html>`,
    { status, headers: headers({ 'content-type': 'text/html; charset=utf-8', ...extra }) },
  );

const isConfigured = (env: Env) => REQUIRED_CONFIG.every((key) => typeof env[key] === 'string' && env[key].length > 0);

const normalizePhone = (value: string) => value.replace(/\D/g, '');

export function createContactHandler(dependencies: ContactHandlerDependencies) {
  return async function handle(request: Request, env: Env): Promise<Response> {
    if (!isConfigured(env)) return errorResponse(503, 'Contacto no disponible', 'La configuración de contacto no está lista.');
    const phone = normalizePhone(env.WHATSAPP_PHONE);
    if (!/^\d{10,15}$/.test(phone)) return errorResponse(503, 'Contacto no disponible', 'La configuración de contacto no está lista.');
    if (request.method !== 'POST') return errorResponse(405, 'Método no permitido', 'Usa el formulario de contacto para continuar.');
    if (request.headers.get('Origin') !== env.ALLOWED_ORIGIN) return errorResponse(403, 'Solicitud no permitida', 'No se pudo validar el origen de la solicitud.');
    const clientIp = request.headers.get('CF-Connecting-IP');
    if (!clientIp) return errorResponse(400, 'Solicitud incompleta', 'Falta la información necesaria para validar el acceso.');

    const contentType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase();
    if (contentType !== 'application/x-www-form-urlencoded' && contentType !== 'multipart/form-data') {
      return errorResponse(415, 'Formato no permitido', 'Envía el formulario con un formato válido.');
    }
    const declaredLength = Number(request.headers.get('Content-Length') ?? '0');
    if (declaredLength > 4096) return errorResponse(413, 'Solicitud demasiado grande', 'Reduce el tamaño de la solicitud e inténtalo de nuevo.');
    if (declaredLength === 0) {
      try {
        if ((await request.clone().arrayBuffer()).byteLength > 4096) {
          return errorResponse(413, 'Solicitud demasiado grande', 'Reduce el tamaño de la solicitud e inténtalo de nuevo.');
        }
      } catch {
        return errorResponse(400, 'Solicitud incompleta', 'No se pudo leer el formulario.');
      }
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return errorResponse(400, 'Solicitud incompleta', 'No se pudo leer el formulario.');
    }
    const keys = Array.from(form.keys());
    if (keys.some((key) => key !== 'cf-turnstile-response') || keys.length !== 1) {
      return errorResponse(400, 'Solicitud incompleta', 'El formulario no tiene el formato esperado.');
    }
    const token = form.get('cf-turnstile-response');
    if (typeof token !== 'string' || token.length === 0 || token.length > 4096) {
      return errorResponse(400, 'Verificación requerida', 'Completa la verificación de seguridad.');
    }

    let clientHash: string;
    try {
      clientHash = await dependencies.hashClientIp(clientIp, env.RATE_LIMIT_HMAC_SECRET);
    } catch {
      return errorResponse(503, 'Contacto no disponible', 'No se pudo validar el acceso.');
    }
    let quota: { allowed: boolean; retryAfterSeconds: number };
    try {
      quota = await dependencies.rateLimiter.reserve(clientHash, dependencies.now());
    } catch {
      return errorResponse(503, 'Contacto no disponible', 'No se pudo validar el acceso.');
    }
    if (!quota.allowed) return errorResponse(429, 'Demasiadas solicitudes', 'Espera un momento antes de intentarlo de nuevo.', { 'retry-after': String(Math.max(1, Math.ceil(quota.retryAfterSeconds))) });

    let verification: TurnstileResult;
    try {
      verification = await dependencies.verifyTurnstile({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteIp: clientIp });
    } catch {
      return errorResponse(503, 'Contacto no disponible', 'No se pudo validar el acceso.');
    }
    if (!verification.success || verification.hostname !== env.TURNSTILE_HOSTNAME || verification.action !== TURNSTILE_ACTION) {
      return errorResponse(403, 'Verificación no válida', 'Completa la verificación e inténtalo de nuevo.');
    }

    return new Response(null, {
      status: 303,
      headers: headers({ location: `https://wa.me/${phone}?text=${encodeURIComponent(CONTACT_MESSAGE)}` }),
    });
  };
}

export const handleContact = createContactHandler({
  verifyTurnstile: ({ secret, response, remoteIp }) => verifyTurnstile({ secret, response, remoteIp }),
  hashClientIp,
  rateLimiter: {
    reserve: async () => ({ allowed: false, retryAfterSeconds: RATE_LIMIT_POLICY.windowSeconds }),
  },
  now: () => Math.floor(Date.now() / 1000),
});

export { CONTACT_PATH };
