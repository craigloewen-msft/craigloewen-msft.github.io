import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const OUT = process.env.OUT ?? 'screenshots';

const shots = [
  { name: 'home-dark', path: '/', theme: 'dark', full: true },
  { name: 'home-light', path: '/', theme: 'light', full: true },
  { name: 'writing-dark', path: '/writing', theme: 'dark', full: true },
  { name: 'talks-dark', path: '/talks', theme: 'dark', full: true },
  { name: 'projects-dark', path: '/projects', theme: 'dark', full: true },
  { name: 'about-dark', path: '/about', theme: 'dark', full: true },
  { name: 'post-dark', path: '/blog/2026/08/28/kingdom-ide/', theme: 'dark', full: true },
  {
    name: 'post-legacy-charts',
    path: '/blog/2018/06/11/reddit-opinion-github-acquisition/',
    theme: 'dark',
    full: true,
  },
  { name: 'project-detail', path: '/projects/watvision', theme: 'dark', full: true },
  { name: 'home-mobile', path: '/', theme: 'dark', full: true, width: 390, height: 844 },
  { name: 'talks-mobile', path: '/talks', theme: 'dark', full: true, width: 390, height: 844 },
  { name: '404', path: '/does-not-exist', theme: 'dark', full: false },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: { width: shot.width ?? 1440, height: shot.height ?? 1000 },
    deviceScaleFactor: 2,
    colorScheme: shot.theme === 'light' ? 'light' : 'dark',
  });

  const page = await context.newPage();

  // Seed the theme preference before any script runs.
  await page.addInitScript((theme) => {
    localStorage.setItem('theme', theme);
  }, shot.theme);

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
