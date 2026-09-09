import { getCollection } from 'astro:content';
import { postPath } from './urls';

export interface SearchEntry {
  title: string;
  href: string;
  kind: 'Page' | 'Writing' | 'Talk' | 'Video' | 'Project' | 'Article';
  meta?: string;
  external?: boolean;
}

const staticPages: SearchEntry[] = [
  { title: 'Home', href: '/', kind: 'Page' },
  { title: 'Writing', href: '/writing', kind: 'Page' },
  { title: 'Talks', href: '/talks', kind: 'Page' },
  { title: 'Projects', href: '/projects', kind: 'Page' },
  { title: 'About', href: '/about', kind: 'Page' },
  { title: 'Resume', href: '/download_src/Craig_Loewen_Resume.pdf', kind: 'Page', external: true },
];

const year = (d: Date) => String(d.getUTCFullYear());

/** Builds the flat index powering the ⌘K palette. */
export async function getSearchIndex(): Promise<SearchEntry[]> {
  const [posts, talks, videos, projects] = await Promise.all([
    getCollection('writing', ({ data }) => !data.draft),
    getCollection('talks'),
    getCollection('videos'),
    getCollection('projects'),
  ]);

  return [
    ...staticPages,

    ...posts.map((p) => ({
      title: p.data.title,
      href: postPath(p.data.date, p.id),
      kind: 'Writing' as const,
      meta: year(p.data.date),
    })),

    ...projects.map((p) => ({
      title: p.data.name,
      href: `/projects/${p.id}`,
      kind: 'Project' as const,
      meta: p.data.tagline,
    })),

    ...talks
      .filter((t) => t.data.url)
      .map((t) => ({
        title: t.data.title,
        href: t.data.url!,
        kind: 'Talk' as const,
        meta: [t.data.conference, year(t.data.date)].filter(Boolean).join(' · '),
        external: true,
      })),

    ...videos.map((v) => ({
      title: v.data.title,
      href: v.data.url,
      kind: 'Video' as const,
      meta: year(v.data.date),
      external: true,
    })),
  ];
}
