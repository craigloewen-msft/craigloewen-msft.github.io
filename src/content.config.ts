import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'zod';
import { load as loadYaml } from 'js-yaml';

/**
 * The YAML data files are plain arrays without ids, which the `file()` loader
 * requires. This parser loads the array and derives a stable slug-ish id.
 */
function yamlArray(prefix: string) {
  return (text: string): Record<string, Record<string, unknown>> => {
    const parsed = loadYaml(text);
    if (!Array.isArray(parsed)) return {};
    const seen = new Map<string, number>();
    const out: Record<string, Record<string, unknown>> = {};

    for (const entry of parsed as Record<string, unknown>[]) {
      const base =
        String(entry.title ?? 'item')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60) || 'item';

      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? `${prefix}-${base}` : `${prefix}-${base}-${count + 1}`;
      out[id] = { ...entry, id };
    }
    return out;
  };
}

/** Long-form posts written by Craig. */
const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string().default('Craig Loewen'),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Legacy Jekyll permalink that must keep resolving. */
    legacyUrl: z.string().optional(),
  }),
});

/** Conference talks and panels. */
const talks = defineCollection({
  loader: file('./src/data/talks.yml', { parser: yamlArray('talk') }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    conference: z.string().optional(),
    location: z.string().optional(),
    date: z.coerce.date(),
    url: z.url().optional(),
  }),
});

/** Recorded videos and demos. */
const videos = defineCollection({
  loader: file('./src/data/videos.yml', { parser: yamlArray('video') }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    date: z.coerce.date(),
    url: z.url(),
  }),
});

/** Posts published on external publications (devblogs, windows blog, ...). */
const externalPosts = defineCollection({
  loader: file('./src/data/blogs.yml', { parser: yamlArray('ext') }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    date: z.coerce.date(),
    url: z.url(),
  }),
});

/** Portfolio projects. */
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      tagline: z.string(),
      date: z.coerce.date(),
      cover: image(),
      coverAlt: z.string(),
      /** Logos need `contain` so they aren't cropped by the card's fixed aspect ratio. */
      coverFit: z.enum(['cover', 'contain']).default('cover'),
      featured: z.boolean().default(false),
      order: z.number().default(100),
      role: z.string().optional(),
      tech: z.array(z.string()).default([]),
      links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    }),
});

export const collections = { writing, talks, videos, externalPosts, projects };
