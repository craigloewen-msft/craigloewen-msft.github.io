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

// The index must not be inlined into the page; it is fetched on first open.
const inlineIndex = await page.evaluate(() =>
  document.documentElement.outerHTML.includes('"kind":"Talk"'),
);
check('search index is not inlined into the HTML', !inlineIndex);

await page.keyboard.press('Control+k');
await dialog.waitFor({ state: 'visible', timeout: 5000 });
check('Ctrl+K opens the command palette', await dialog.isVisible());
check(
  'palette autofocuses its input',
  await combobox.evaluate((el) => el === document.activeElement),
);

await page.keyboard.type('puppet');
await page.waitForTimeout(600);
const hitCount = await options.count();
const firstLabel = hitCount ? (await options.first().innerText()).replace(/\s+/g, ' ').trim() : '';
check(
  'palette fetched its index and filters',
  hitCount > 0 && hitCount < 12,
  `${hitCount} results`,
);
check('top hit matches the query', /puppet/i.test(firstLabel), firstLabel);
check(
  'active option is exposed via aria-activedescendant',
  (await combobox.getAttribute('aria-activedescendant')) === 'command-option-0',
);
await page.screenshot({ path: `${OUT}/palette-search.png` });

// Talks and external articles are searchable, not just my own posts.
await combobox.fill('ignite');
await page.waitForTimeout(300);
check('palette indexes talks', (await options.count()) > 0, `${await options.count()} results`);
await combobox.fill('');
await page.waitForTimeout(300);

await page.keyboard.press('Escape');
await dialog.waitFor({ state: 'hidden', timeout: 3000 });
check('Escape closes the palette', (await dialog.count()) === 0);

const trigger = page.locator('[data-command-trigger]').first();
check(
  'search trigger reads "Ctrl K"',
  /ctrl\s*k/i.test(await trigger.innerText()),
  await trigger.innerText(),
);
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

// ---------- Dark only ----------
check(
  'no theme toggle is rendered',
  (await page.getByRole('button', { name: /theme/i }).count()) === 0,
);
check(
  'html has no light class',
  await page.evaluate(() => !document.documentElement.classList.contains('light')),
);
check(
  'page renders on a dark surface',
  await page.evaluate(() => {
    const bg = getComputedStyle(document.body).backgroundColor;
    const [r, g, b] = bg.match(/\d+/g).map(Number);
    return (r + g + b) / 3 < 60;
  }),
);
check('no Apple command glyph anywhere', !(await page.content()).includes('\u2318'));

// ---------- Merged writing & talks ----------
await page.goto(`${BASE}/writing`, { waitUntil: 'networkidle' });
const items = page.locator('[data-stream-item]');
const total = await items.count();
check('stream renders every item', total > 60, `${total} items`);

const kinds = await page.$$eval('[data-stream-item]', (els) => [
  ...new Set(els.map((el) => el.dataset.kind)),
]);
check(
  'stream unifies posts, articles, talks and videos',
  ['post', 'article', 'talk', 'video'].every((k) => kinds.includes(k)),
  kinds.join(', '),
);

const nav = page.locator('header nav');
check(
  'nav no longer has a separate Talks link',
  (await nav.getByText('Talks', { exact: true }).count()) === 0,
);
// Desktop and mobile nav both point at the merged page.
check(
  'nav links to the merged page',
  (await page.locator('header a[href="/writing"]').count()) === 2,
  `${await page.locator('header a[href="/writing"]').count()} links`,
);
check(
  'nav label reads "Writing & talks"',
  /writing & talks/i.test(await nav.locator('a[href="/writing"]').first().innerText()),
);
// Writing and speaking are one page; the header should stay at two destinations
// (each rendered twice — desktop and mobile).
check(
  'nav stays down to two destinations',
  (await nav.locator('a[href^="/"]').count()) === 4,
  `${await nav.locator('a[href^="/"]').count()} links`,
);

const search = page.locator('[data-stream-search]');
await search.fill('WSL');
await page.waitForTimeout(300);
const visible = () => page.locator('[data-stream-item]:not([hidden])').count();
const filtered = await visible();
check(
  'stream search narrows the list',
  filtered > 0 && filtered < total,
  `${filtered} of ${total}`,
);
await page.screenshot({ path: `${OUT}/writing-search.png` });

await search.fill('zzzznope');
await page.waitForTimeout(300);
check('empty state shows for no matches', await page.locator('[data-stream-empty]').isVisible());
check(
  'result count is announced',
  /0 results/.test(await page.locator('[data-stream-count]').innerText()),
);
check(
  'empty year headings are hidden',
  (await page.locator('[data-stream-year]:not([hidden])').count()) === 0,
);

await search.fill('');
await page.waitForTimeout(300);
check('clearing search restores all items', (await visible()) === total);

const filterBtns = page.locator('[data-stream-filter]');
check(
  'type filters render',
  (await filterBtns.count()) === 5,
  `${await filterBtns.count()} filters`,
);

await page.locator('[data-stream-filter="talk"]').click();
await page.waitForTimeout(300);
const talkCount = await visible();
check(
  'filtering to Talks narrows the list',
  talkCount > 0 && talkCount < total,
  `${talkCount} of ${total}`,
);
check(
  'only talks remain visible',
  await page.$$eval('[data-stream-item]:not([hidden])', (els) =>
    els.every((el) => el.dataset.kind === 'talk'),
  ),
);
check(
  'active filter is exposed via aria-pressed',
  (await page.locator('[data-stream-filter="talk"]').getAttribute('aria-pressed')) === 'true',
);
await page.screenshot({ path: `${OUT}/writing-filter.png` });

await search.fill('WSL');
await page.waitForTimeout(300);
check('filter and search compose', (await visible()) <= talkCount);

await search.fill('');
await page.locator('[data-stream-filter="all"]').click();
await page.waitForTimeout(300);
check('resetting restores all items', (await visible()) === total);

// The pre-Microsoft project archive left both the header and the homepage, so
// /about is now the only route to it. That link has to keep working.
await page.goto(`${BASE}/about`, { waitUntil: 'networkidle' });
check(
  'about links to the project archive',
  (await page.locator('main a[href="/projects"]').count()) > 0,
);
await page.locator('main a[href="/projects"]').first().click();
await page.waitForURL('**/projects');
check('that link reaches the archive page', new URL(page.url()).pathname === '/projects');

// The homepage leads with current work, not the old projects grid.
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
check(
  'homepage no longer leads with old projects',
  (await page.locator('main a[href^="/projects"]').count()) === 0,
);
check(
  'homepage sends talk traffic to the merged page',
  (await page.locator('main a[href="/writing"]').count()) > 0,
);
await page.goto(`${BASE}/writing`, { waitUntil: 'networkidle' });

// ---------- Progressive enhancement ----------
const noJs = await browser.newContext({ javaScriptEnabled: false });
const noJsPage = await noJs.newPage();
await noJsPage.goto(`${BASE}/writing`, { waitUntil: 'domcontentloaded' });
const noJsItems = await noJsPage.locator('[data-stream-item]').count();
check('full list renders without JavaScript', noJsItems === total, `${noJsItems} items`);
check(
  'filter controls stay hidden without JavaScript',
  await noJsPage.locator('[data-stream-controls]').isHidden(),
);
await noJs.close();

// ---------- Legacy routes ----------
for (const [from, to] of [
  ['/talks', '/writing'],
  ['/speaking', '/writing'],
  ['/activity', '/writing'],
  ['/allposts', '/writing'],
]) {
  await page.goto(`${BASE}${from}`, { waitUntil: 'networkidle' });
  check(`${from} redirects to ${to}`, new URL(page.url()).pathname === to, page.url());
}

// ---------- Mobile navigation ----------
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
const mobilePage = await mobile.newPage();
mobilePage.on('pageerror', (e) => errors.push(String(e)));
mobilePage.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await mobilePage.goto(`${BASE}/`, { waitUntil: 'networkidle' });

const menuTrigger = mobilePage.locator('[data-menu-trigger]');
const mobileNav = mobilePage.locator('#mobile-nav');
check('hamburger is visible on mobile', await menuTrigger.isVisible());
check('mobile nav starts closed', await mobileNav.isHidden());

// A second click listener would cancel the first one's toggle out, so this
// also guards against the setup script binding twice.
await menuTrigger.click();
check('hamburger opens the mobile nav', await mobileNav.isVisible());
check(
  'open state is exposed via aria-expanded',
  (await menuTrigger.getAttribute('aria-expanded')) === 'true',
);
await mobilePage.screenshot({ path: `${OUT}/mobile-menu.png` });

await menuTrigger.click();
check('hamburger closes the mobile nav again', await mobileNav.isHidden());

await menuTrigger.click();
await mobileNav.locator('a[href="/writing"]').first().click();
await mobilePage.waitForURL('**/writing');
check('mobile nav links navigate', new URL(mobilePage.url()).pathname === '/writing');
check('mobile nav closes after navigating', await mobilePage.locator('#mobile-nav').isHidden());

await mobilePage.locator('[data-menu-trigger]').click();
check(
  'hamburger still works after a client-side nav',
  await mobilePage.locator('#mobile-nav').isVisible(),
);
await mobile.close();

// ---------- Accessibility ----------
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
const skip = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
check('first Tab lands on the skip link', /skip/i.test(skip), skip);

for (const path of ['/', '/writing', '/projects', '/about']) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  const missing = await page.$$eval('img:not([alt])', (els) => els.length);
  check(`all images on ${path} have alt text`, missing === 0, `${missing} missing`);
}

// ---------- Speaking map ----------
await page.goto(`${BASE}/writing`, { waitUntil: 'networkidle' });
const pins = page.locator('.pin');
const mapPanel = page.locator('[data-map-panel]');
const pinCount = await pins.count();
check('speaking map renders a pin per city', pinCount > 0, `${pinCount} pins`);
check('map is server-rendered, not fetched', (await page.locator('svg path[d^="M"]').count()) > 0);

const summaryText = (await mapPanel.innerText()).trim();
await page.locator('.pin[data-city="Seoul"]').hover();
await page.waitForTimeout(250);
const hovered = (await mapPanel.innerText()).trim();
check('hovering a pin shows that city’s talks', /seoul/i.test(hovered) && hovered !== summaryText);

await page.locator('.pin[data-city="London"]').focus();
await page.waitForTimeout(250);
check(
  'pins are keyboard focusable and update the panel',
  /london/i.test(await mapPanel.innerText()),
);

await page.locator('[data-city-chip="Riga"]').click();
await page.waitForTimeout(250);
check(
  'city chips pin a selection',
  (await page.locator('[data-city-chip="Riga"]').getAttribute('aria-pressed')) === 'true' &&
    /riga/i.test(await mapPanel.innerText()),
);

const noJsSpeakingCtx = await browser.newContext({ javaScriptEnabled: false });
const noJsSpeaking = await noJsSpeakingCtx.newPage();
await noJsSpeaking.goto(`${BASE}/writing`, { waitUntil: 'domcontentloaded' });
check(
  'map and city list render without JavaScript',
  (await noJsSpeaking.locator('.pin').count()) === pinCount &&
    (await noJsSpeaking.locator('[data-city-chip]').count()) === pinCount,
);
await noJsSpeakingCtx.close();

// ---------- Guitar video facade ----------
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.locator('#beyond').scrollIntoViewIfNeeded();
await page.waitForTimeout(800);

const thirdParty = [];
page.on('request', (r) => {
  if (/youtube|ytimg/.test(r.url())) thirdParty.push(r.url());
});

check(
  'video shows a local poster, not a YouTube request',
  thirdParty.length === 0 && (await page.locator('.video-embed img').count()) === 1,
  `${thirdParty.length} third-party requests`,
);
check(
  'offline photos all load',
  (await page.$$eval('#beyond img', (els) =>
    els.every((e) => e.complete && e.naturalWidth > 0),
  )) === true,
);

await page.locator('[data-video-trigger]').click();
await page.waitForTimeout(1200);
const embedded = await page.locator('.video-embed iframe').getAttribute('src');
check(
  'clicking play swaps in the privacy-mode player',
  (embedded ?? '').startsWith('https://www.youtube-nocookie.com/embed/'),
  embedded ?? 'no iframe',
);

const noJsVideoCtx = await browser.newContext({ javaScriptEnabled: false });
const noJsVideo = await noJsVideoCtx.newPage();
await noJsVideo.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
check(
  'video degrades to a YouTube link without JavaScript',
  /youtube\.com\/watch\?v=/.test(
    (await noJsVideo.locator('[data-video-trigger]').getAttribute('href')) ?? '',
  ),
);
await noJsVideoCtx.close();

check('no console or page errors', errors.length === 0, errors.slice(0, 3).join(' | '));

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exitCode = 1;
