import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const OUT = process.env.OUT ?? '/tmp/interact';
mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

// ---------- Command palette ----------
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const dialog = page.locator('[role="dialog"][aria-label="Search the site"]');
const options = page.locator('[role="option"]');
const combobox = page.locator('input[role="combobox"]');

await page.keyboard.press('Control+k');
await dialog.waitFor({ state: 'visible', timeout: 5000 });
check('Ctrl/Cmd+K opens the command palette', await dialog.isVisible());
check(
  'palette autofocuses its input',
  await combobox.evaluate((el) => el === document.activeElement),
);

await page.keyboard.type('puppet');
await page.waitForTimeout(300);
const hitCount = await options.count();
const firstLabel = hitCount ? (await options.first().innerText()).replace(/\s+/g, ' ').trim() : '';
check('palette search filters results', hitCount > 0 && hitCount < 12, `${hitCount} results`);
check('top hit matches the query', /puppet/i.test(firstLabel), firstLabel);
check(
  'active option is exposed via aria-activedescendant',
  (await combobox.getAttribute('aria-activedescendant')) === 'command-option-0',
);
await page.screenshot({ path: `${OUT}/palette-search.png` });

await page.keyboard.press('Enter');
await page.waitForTimeout(1000);
check('Enter navigates to the selected result', new URL(page.url()).pathname !== '/', page.url());

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.keyboard.press('Control+k');
await dialog.waitFor({ state: 'visible' });
await page.keyboard.type('zzzznope');
await page.waitForTimeout(300);
check('palette shows a no-match message', await page.getByText(/No matches for/).isVisible());

await page.keyboard.press('Escape');
await dialog.waitFor({ state: 'hidden', timeout: 3000 });
check('Escape closes the palette', (await dialog.count()) === 0);

const trigger = page.locator('[data-command-trigger]').first();
await trigger.click();
await dialog.waitFor({ state: 'visible', timeout: 3000 });
check('search button opens the palette', await dialog.isVisible());
await page.keyboard.press('Escape');
await dialog.waitFor({ state: 'hidden' });
check(
  'focus returns to the trigger after closing',
  await trigger.evaluate(
    (el) => el === document.activeElement || el.contains(document.activeElement),
  ),
);

// ---------- Theme toggle ----------
const htmlClass = () => page.evaluate(() => document.documentElement.className);
const toggle = page.getByRole('button', { name: /theme/i }).first();
const before = await htmlClass();
await toggle.click();
await page.waitForTimeout(300);
const after = await htmlClass();
check('theme toggle flips the theme', before !== after, `"${before}" -> "${after}"`);
const persisted = await page.evaluate(() => localStorage.getItem('theme'));
check('theme choice persists to localStorage', !!persisted, String(persisted));
await page.reload({ waitUntil: 'networkidle' });
check('theme survives a reload', (await htmlClass()) === after);
await toggle.click();
await page.waitForTimeout(200);

// ---------- Talk explorer ----------
await page.goto(`${BASE}/talks`, { waitUntil: 'networkidle' });
const cards = page.locator('main section ul > li');
const total = await cards.count();
check('talk explorer renders items', total > 20, `${total} items`);

const search = page.locator('input[type="search"]').first();
await search.fill('WSL');
await page.waitForTimeout(400);
const filtered = await cards.count();
check('talk search narrows the list', filtered > 0 && filtered < total, `${filtered} of ${total}`);
await page.screenshot({ path: `${OUT}/talks-search.png` });

await search.fill('zzzznope');
await page.waitForTimeout(400);
check(
  'talks empty state shows for no matches',
  await page.getByText(/Nothing matches/).isVisible(),
);
check(
  'result count is announced',
  /0 results/.test(await page.locator('[aria-live="polite"]').first().innerText()),
);

await search.fill('');
await page.waitForTimeout(300);
check('clearing search restores all items', (await cards.count()) === total);

const filterBtns = page.locator('[aria-label="Filter by type"] button');
const nFilters = await filterBtns.count();
check('type filters render', nFilters >= 3, `${nFilters} filters`);

await filterBtns.nth(1).click();
await page.waitForTimeout(400);
const afterFilter = await cards.count();
check(
  'type filter narrows the list',
  afterFilter > 0 && afterFilter < total,
  `${afterFilter} of ${total}`,
);
check(
  'active filter is exposed via aria-pressed',
  (await filterBtns.nth(1).getAttribute('aria-pressed')) === 'true',
);
await page.screenshot({ path: `${OUT}/talks-filter.png` });

await search.fill('WSL');
await page.waitForTimeout(400);
check('filter and search compose', (await cards.count()) <= afterFilter);

await search.fill('');
await filterBtns.nth(0).click();
await page.waitForTimeout(300);
check('resetting the filter restores all items', (await cards.count()) === total);

// ---------- Keyboard accessibility ----------
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
const skip = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
check('first Tab lands on the skip link', /skip/i.test(skip), skip);

for (const path of ['/', '/writing', '/talks', '/projects', '/about']) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  const missing = await page.$$eval('img:not([alt])', (els) => els.length);
  check(`all images on ${path} have alt text`, missing === 0, `${missing} missing`);
}

check('no console or page errors', errors.length === 0, errors.slice(0, 3).join(' | '));

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exitCode = 1;
