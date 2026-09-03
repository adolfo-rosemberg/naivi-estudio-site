import { CONTACT_PATH } from '../shared/contact';
import { handleContact } from './contact-handler';
import { withSecurityHeaders } from './security';
import type { Env } from './types';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === CONTACT_PATH) return withSecurityHeaders(await handleContact(request, env));
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
