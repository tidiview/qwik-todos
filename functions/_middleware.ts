// functions/_middleware.ts
import type { PagesFunction } from '@cloudflare/workers-types';
import worker from '../dist/_worker.js';

// On délègue tout à _worker.js (qui expose .fetch)
export const onRequest: PagesFunction = async (ctx) => {
  return worker.fetch(ctx.request, ctx.env, ctx);
};
