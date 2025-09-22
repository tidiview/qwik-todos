// functions/_middleware.ts
import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequest: PagesFunction = async (context) => {
  // Ici tu peux ajouter tes middlewares (logs, auth, headers, etc.)
  return context.next();
};
