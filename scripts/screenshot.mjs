import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const OUT = process.env.OUT ?? 'screenshots';

const shots = [
  { name: 'home', path: '/', full: true },
  { name: 'writing', path: '/writing', full: true },
  { name: 'projects', path: '/projects', full: true },
  { name: 'about', path: '/about', full: true },
  { name: 'post', path: '/blog/2026/08/28/kingdom-ide/', full: true },
  {
    name: 'post-legacy-charts',
    path: '/blog/2018/06/11/reddit-opinion-github-acquisition/',
    full: true,
  },
  { name: 'project-detail', path: '/projects/watvision', full: true },
  { name: 'home-mobile', path: '/', full: true, width: 390, height: 844 },
  { name: 'writing-mobile', path: '/writing', full: true, width: 390, height: 844 },
  { name: '404', path: '/does-not-exist', full: false },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: { width: shot.width ?? 1440, height: shot.height ?? 1000 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });

  const page = await context.newPage();
  await page.goto(BASE + shot.path, { waitUntil: 'networkidle' });

  // Force scroll-reveal elements visible so full-page shots aren't blank.
  await page.evaluate(() => {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
  });
  await page.waitForTimeout(600);

  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: shot.full });
  console.log(`captured ${shot.name}`);
  await context.close();
}

await browser.close();
console.log('done');
