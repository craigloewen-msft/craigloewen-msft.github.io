/**
 * Verifies the production build: every internal link and asset reference in dist/
 * resolves to a real file, legacy URLs still work, and the feed/sitemap are valid.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { globSync } from 'node:fs';

const DIST = resolve(process.env.DIST ?? 'dist');
const problems = [];
const note = (msg) => problems.push(msg);

const htmlFiles = globSync('**/*.html', { cwd: DIST }).filter((f) =>
  statSync(join(DIST, f)).isFile(),
);
console.log(`Scanning ${htmlFiles.length} HTML files in ${DIST}\n`);

/** Resolve a site-absolute URL to a file on disk, allowing directory indexes. */
function resolves(urlPath) {
  const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  if (clean === '/') return existsSync(join(DIST, 'index.html'));
  const target = join(DIST, clean);
  if (existsSync(target) && statSync(target).isFile()) return true;
  if (existsSync(join(target, 'index.html'))) return true;
  if (existsSync(`${target}.html`)) return true;
  return false;
}

const internalLinks = new Set();
const externalLinks = new Set();

for (const file of htmlFiles) {
  const html = readFileSync(join(DIST, file), 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);

  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(ref)) {
      if (ref.startsWith('http')) externalLinks.add(ref);
      continue;
    }
    if (!ref.startsWith('/')) {
      note(`${file}: relative reference "${ref}" (expected site-absolute)`);
      continue;
    }
    internalLinks.add(ref);
    if (!resolves(ref)) note(`${file}: broken internal link "${ref}"`);
  }

  // srcset entries
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of m[1].split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url.startsWith('/') && !resolves(url)) note(`${file}: broken srcset entry "${url}"`);
    }
  }
}

console.log(`${internalLinks.size} unique internal links, ${externalLinks.size} external.`);

// ---- Legacy URLs that must never break ----
const legacy = [
  // Exactly the permalinks Jekyll produced from _posts/<date>-<slug>.markdown.
  '/blog/2018/06/10/reddit-opinion-github-acquisition-ds/',
  '/blog/2018/06/11/reddit-opinion-github-acquisition/',
  '/blog/2019/12/04/running-puppet-quickly-in-wsl2/',
  '/blog/2022/02/25/ticdapptoe-create-web-3-app/',
  '/blog/2023/08/03/wsl-edge-default-browser/',
  '/blog/2026/08/28/kingdom-ide/',
  '/apple-touch-icon.png',
  '/download_src/Craig_Loewen_Resume.pdf',
  '/img/visualization.gif',
  '/img/browser-tool.png',
  '/img/isolation-comparison.png',
  '/img/review-process.png',
  '/img/shared-resources.png',
  '/feed.xml',
  '/sitemap-index.xml',
  '/CNAME',
  '/robots.txt',
  '/og/default.png',
  '/allposts',
  '/activity',
  '/spot-me',
  '/writing',
  '/talks',
  '/projects',
  '/about',
  '/404.html',
];
for (const url of legacy) {
  if (!resolves(url)) note(`legacy URL no longer resolves: ${url}`);
}

// ---- Feed and sitemap sanity ----
const feed = readFileSync(join(DIST, 'feed.xml'), 'utf8');
const feedItems = [...feed.matchAll(/<item>/g)].length;
if (feedItems < 6) note(`feed.xml has only ${feedItems} items`);
if (!feed.includes('https://www.craigloewen.com/blog/')) note('feed.xml lacks absolute post URLs');
console.log(`feed.xml: ${feedItems} items`);

const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>/g)].length;
if (urls < 10) note(`sitemap has only ${urls} URLs`);
console.log(`sitemap: ${urls} URLs`);

// ---- Every page has the SEO essentials ----
for (const file of htmlFiles) {
  const html = readFileSync(join(DIST, file), 'utf8');
  if (html.includes('http-equiv="refresh"')) continue; // redirect stub
  if (!/<title>[^<]+<\/title>/.test(html)) note(`${file}: missing <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) note(`${file}: missing description`);
  if (!/<meta property="og:image"/.test(html)) note(`${file}: missing og:image`);
  if (!/rel="canonical"/.test(html)) note(`${file}: missing canonical`);
  if (/<img(?![^>]*\salt=)/.test(html)) note(`${file}: <img> without alt`);
}

// ---- No leftovers from the old stack ----
for (const file of htmlFiles) {
  const html = readFileSync(join(DIST, file), 'utf8');
  for (const [needle, label] of [
    ['jquery', 'jQuery'],
    ['bootstrap.min.js', 'Bootstrap JS'],
    ['font-awesome', 'Font Awesome'],
    ['html5shiv', 'IE8 shim'],
    ['{%', 'unrendered Liquid tag'],
    ['{{', 'unrendered Liquid/JSX expression'],
  ]) {
    if (html.toLowerCase().includes(needle.toLowerCase())) note(`${file}: contains ${label}`);
  }
}

console.log('');
if (problems.length) {
  console.log(`${problems.length} problem(s):`);
  for (const p of problems) console.log(`  FAIL  ${p}`);
  process.exitCode = 1;
} else {
  console.log('All build checks passed.');
}
