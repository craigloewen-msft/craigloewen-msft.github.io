/**
 * One-shot migration: Jekyll `_posts` -> Astro content collection.
 * Preserves the legacy /blog/:year/:month/:day/:slug/ permalink structure and
 * rewrites Jekyll `{% post_url %}` Liquid tags into real URLs.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const SRC = '_posts';
const DEST = 'src/content/writing';

const FILENAME_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.(markdown|md)$/;

function permalinkFor(year, month, day, slug) {
  return `/blog/${year}/${month}/${day}/${slug}/`;
}

const files = (await readdir(SRC)).filter((f) => FILENAME_RE.test(f));

// First pass: build a filename-stem -> permalink map for post_url resolution.
const bySlugStem = new Map();
for (const f of files) {
  const [, year, month, day, slug] = f.match(FILENAME_RE);
  bySlugStem.set(f.replace(/\.(markdown|md)$/, ''), {
    permalink: permalinkFor(year, month, day, slug),
    slug,
  });
}

await mkdir(DEST, { recursive: true });

for (const f of files) {
  const [, year, month, day, slug] = f.match(FILENAME_RE);
  const raw = await readFile(join(SRC, f), 'utf8');

  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!fm) {
    console.warn(`skip (no frontmatter): ${f}`);
    continue;
  }
  const [, frontmatter, bodyRaw] = fm;

  const get = (key) => {
    const m = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
  };

  const title = get('title') ?? slug;
  const author = get('author') ?? 'Craig Loewen';

  // Rewrite {% post_url some-post %} -> real permalink
  const body = bodyRaw.replace(/\{%\s*post_url\s+([^\s%]+)\s*%\}/g, (whole, stem) => {
    const target = bySlugStem.get(stem);
    if (!target) {
      console.warn(`  unresolved post_url in ${f}: ${stem}`);
      return whole;
    }
    return target.permalink;
  });

  // Derive a description from the first meaningful prose paragraph.
  const firstProse = body
    .split(/\r?\n\r?\n/)
    .map((b) => b.trim())
    .find((b) => b && !b.startsWith('<') && !b.startsWith('#') && !b.startsWith('!['));
  const description = firstProse
    ? firstProse
        .replace(/[*_`>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 180)
        .replace(/\s+\S*$/, '')
    : undefined;

  const esc = (s) => `'${String(s).replace(/'/g, "''")}'`;

  const newFrontmatter = [
    '---',
    `title: ${esc(title)}`,
    `date: ${year}-${month}-${day}`,
    `author: ${esc(author)}`,
    ...(description ? [`description: ${esc(description)}`] : []),
    '---',
    '',
  ].join('\n');

  await writeFile(join(DEST, `${slug}.md`), newFrontmatter + body.trimStart() + '\n', 'utf8');
  console.log(`migrated ${f} -> ${slug}.md   (${permalinkFor(year, month, day, slug)})`);
}

console.log(`\n${files.length} posts migrated.`);
