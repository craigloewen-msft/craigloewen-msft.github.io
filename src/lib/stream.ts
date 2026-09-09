import { getCollection } from 'astro:content';
import { postPath, readingTime } from './urls';

export const STREAM_KINDS = ['Post', 'Article', 'Talk', 'Video'] as const;
export type StreamKind = (typeof STREAM_KINDS)[number];

export interface StreamItem {
  title: string;
  kind: StreamKind;
  date: Date;
  href: string;
  external: boolean;
  /** Where it was published or presented. */
  venue?: string;
  description?: string;
  readingMinutes?: number;
}

/** Publications I write for, so external posts can show a venue like talks do. */
const PUBLICATIONS: Record<string, string> = {
  'devblogs.microsoft.com': 'Microsoft Dev Blogs',
  'blogs.windows.com': 'Windows Blog',
  'www.youtube.com': 'YouTube',
  'youtube.com': 'YouTube',
};

function publicationOf(url: string): string | undefined {
  try {
    return PUBLICATIONS[new URL(url).hostname];
  } catch {
    return undefined;
  }
}

/**
 * Everything I've written, said or recorded, newest first.
 *
 * Posts, external articles, talks and videos all used to live in separate
 * places even though they're the same thing from a reader's point of view.
 */
export async function getStream(): Promise<StreamItem[]> {
  const [posts, articles, talks, videos] = await Promise.all([
    getCollection('writing', ({ data }) => !data.draft),
    getCollection('externalPosts'),
    getCollection('talks'),
    getCollection('videos'),
  ]);

  const items: StreamItem[] = [
    ...posts.map((p) => ({
      title: p.data.title,
      kind: 'Post' as const,
      date: p.data.date,
      href: postPath(p.data.date, p.id),
      external: false,
      description: p.data.description,
      readingMinutes: readingTime(p.body),
    })),

    ...articles.map((a) => ({
      title: a.data.title,
      kind: 'Article' as const,
      date: a.data.date,
      href: a.data.url,
      external: true,
      venue: publicationOf(a.data.url),
    })),

    ...talks.map((t) => ({
      title: t.data.title,
      kind: 'Talk' as const,
      date: t.data.date,
      // A few older talks were never recorded, so they have no link.
      href: t.data.url ?? '',
      external: true,
      venue: [t.data.conference, t.data.location].filter(Boolean).join(' · ') || undefined,
    })),

    ...videos.map((v) => ({
      title: v.data.title,
      kind: 'Video' as const,
      date: v.data.date,
      href: v.data.url,
      external: true,
      venue: publicationOf(v.data.url),
    })),
  ];

  return items.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function countByKind(items: StreamItem[]): Record<StreamKind, number> {
  const counts = Object.fromEntries(STREAM_KINDS.map((k) => [k, 0])) as Record<StreamKind, number>;
  for (const item of items) counts[item.kind]++;
  return counts;
}

export function groupByYear(items: StreamItem[]): [number, StreamItem[]][] {
  const byYear = new Map<number, StreamItem[]>();
  for (const item of items) {
    const year = item.date.getUTCFullYear();
    const bucket = byYear.get(year) ?? [];
    bucket.push(item);
    byYear.set(year, bucket);
  }
  return [...byYear.entries()].sort((a, b) => b[0] - a[0]);
}
