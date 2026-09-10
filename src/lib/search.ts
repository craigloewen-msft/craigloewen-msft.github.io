import { getCollection } from 'astro:content';
import { getStream } from './stream';

export interface SearchEntry {
  title: string;
  href: string;
  kind: 'Page' | 'Post' | 'Article' | 'Talk' | 'Video' | 'Project';
  meta?: string;
  external?: boolean;
}

const staticPages: SearchEntry[] = [
  { title: 'Home', href: '/', kind: 'Page' },
  { title: 'Writing & talks', href: '/writing', kind: 'Page' },
  { title: 'Speaking', href: '/speaking', kind: 'Page' },
  { title: 'About', href: '/about', kind: 'Page' },
  { title: 'Project archive', href: '/projects', kind: 'Page' },
  { title: 'Resume', href: '/download_src/Craig_Loewen_Resume.pdf', kind: 'Page', external: true },
];

/** Builds the flat index powering the Ctrl K palette. */
export async function getSearchIndex(): Promise<SearchEntry[]> {
  const [stream, projects] = await Promise.all([getStream(), getCollection('projects')]);

  return [
    ...staticPages,

    // The same unified stream the site renders, minus anything unlinkable.
    ...stream
      .filter((item) => item.href)
      .map((item) => ({
        title: item.title,
        href: item.href,
        kind: item.kind,
        meta: [item.venue, item.date.getUTCFullYear()].filter(Boolean).join(' · '),
        external: item.external,
      })),

    ...projects.map((p) => ({
      title: p.data.name,
      href: `/projects/${p.id}`,
      kind: 'Project' as const,
      meta: p.data.tagline,
    })),
  ];
}
