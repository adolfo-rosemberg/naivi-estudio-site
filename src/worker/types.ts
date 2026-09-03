export interface Env {
  ASSETS: Fetcher;
  RATE_LIMIT_DB: D1Database;
  WHATSAPP_PHONE: string;
  TURNSTILE_SECRET_KEY: string;
  RATE_LIMIT_HMAC_SECRET: string;
  ALLOWED_ORIGIN: string;
  TURNSTILE_HOSTNAME: string;
}

export interface TurnstileResult {
  success: boolean;
  hostname?: string;
  action?: string;
  errorCodes: string[];
}

export interface RateLimiter {
  reserve(clientHash: string, nowSeconds: number): Promise<{ allowed: boolean; retryAfterSeconds: number }>;
}
