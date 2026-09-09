import type { APIRoute } from 'astro';
import { getSearchIndex } from '@/lib/search';

/**
 * The command palette index, served as a file instead of being inlined into
 * every page. It's only fetched if someone actually opens the palette.
 */
export const GET: APIRoute = async () => {
  const entries = await getSearchIndex();

  return new Response(JSON.stringify(entries), {
    headers: { 'content-type': 'application/json' },
  });
};
