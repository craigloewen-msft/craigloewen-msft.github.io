/**
 * URL helpers. The legacy Jekyll permalink shape (/blog/:year/:month/:day/:slug/)
 * is preserved deliberately so existing links and search results keep working.
 */

const pad = (n: number) => String(n).padStart(2, '0');

export function postPath(date: Date, slug: string): string {
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  return `/blog/${y}/${m}/${d}/${slug}/`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

/** Rough reading time, matching the old Jekyll ~180wpm include. */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}
