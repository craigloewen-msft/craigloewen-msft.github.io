# craigloewen.com

My personal site — writing, talks and what I work on. Built with [Astro](https://astro.build),
[Vue](https://vuejs.org) islands and [Tailwind CSS](https://tailwindcss.com), deployed to
GitHub Pages.

## Running it

```bash
npm install
npm run dev      # http://localhost:4321
```

| Script                 | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Dev server with HMR                                 |
| `npm run build`        | Production build into `dist/`                       |
| `npm run preview`      | Serve the production build locally                  |
| `npm run check`        | `astro check` — TypeScript and template diagnostics |
| `npm run format`       | Prettier write                                      |
| `npm run format:check` | Prettier verify (runs in CI)                        |

## How it's put together

```
src/
  assets/img/       images optimised at build time by astro:assets
  components/       .astro components, plus one Vue island
  content/          writing/ and projects/ (Markdown + MDX; projects are an archive)
  data/             talks, videos and external posts (YAML)
  layouts/          BaseLayout — head, header/footer
  lib/              site config and copy, current work, speaking map data, stream, search
  pages/            file-based routes
  styles/global.css the whole design system (Tailwind v4 @theme tokens)
public/             served as-is: CNAME, resume, legacy /img paths
```

Everything is statically rendered. There is exactly one Vue island —
`CommandPalette.vue`, the <kbd>Ctrl</kbd>+<kbd>K</kbd> search — and it fetches its index
from `/search.json` on first open rather than inlining ~15 KB into every page. It must stay
`client:only="vue"`: it uses `Teleport`, which anchors incorrectly during SSR hydration.

Everything else that moves is a small vanilla `<script>` over server-rendered markup, so it
works before hydration and with JavaScript off entirely.

### Content

Writing and talks are one thing on this site. `src/lib/stream.ts` merges four collections —
posts, external articles, talks and videos — into a single date-sorted stream, which feeds
`/writing`, the homepage's "Recent work" section and the search index. `/talks` and
`/speaking` both redirect there.

`ContentStream.astro` renders that whole stream server-side and progressively enhances it
with filter buttons and a search box; the controls stay hidden until the script binds them.

Content is typed with [content collections](https://docs.astro.build/en/guides/content-collections/)
and Zod schemas in `src/content.config.ts`. Adding a post means dropping a Markdown file into
`src/content/writing/`; adding a talk means appending to `src/data/talks.yml`. The schema
will tell you if you get a field wrong.

Post URLs keep the original Jekyll shape — `/blog/:year/:month/:day/:slug/` — so every link
ever shared still resolves. `src/pages/blog/[year]/[month]/[day]/[slug].astro` reconstructs
that path from frontmatter; don't change it without a redirect plan.

### Copy and structure

There are two destinations: `/writing` (everything published, plus the speaking map) and
`/about` (the detailed version). The homepage is deliberately thin — hero, "now", six recent
items, three photos, contact — and anything that wants more room belongs on `/about`.

`src/lib/site.ts` is the single source of truth for voice: tagline, short and long bio (the
press kit on `/about`), the "Now" list, and the beliefs. Edit copy there before editing pages.

**No count is typed into a page.** Talk, city, country, post and project totals all come from
the content collections at build time, and anything phrased as "N years" is derived from the
career start date via `yearsSince()` in `src/lib/site.ts` (`spellOut()` renders it as a word
for running prose). A rebuild is all it takes to make the site current; there is no number to
remember to bump.

Photos are used exactly once each — a face on `/about`, a wide stage shot in the hero, and
three different speaking formats in the `/writing` gallery. Reusing one across two slots is
noticeable, so check before adding.

### Video

`VideoEmbed.astro` is a click-to-load facade: it renders a local poster frame and only injects
the YouTube iframe once someone presses play, which keeps the player's payload and cookies off
the page for everyone who doesn't. Without JavaScript it stays a plain link to YouTube. Poster
frames are committed to `src/assets/img/` rather than hotlinked from `i.ytimg.com`, so the page
makes no third-party request until it's asked to.

`src/lib/work.ts` holds the current product areas — the "What I work on" section of `/about`.
It replaced a grid of pre-2018 university projects that used to lead the homepage. Those
projects still live at `/projects` as an archive linked from `/about`; the URLs and the
content collection are unchanged, they are just no longer the headline.

### The speaking map

`/writing` opens with a map of where I've spoken, built from the same `src/data/talks.yml` as
the stream. `src/lib/speaking.ts` maps each talk's `location` to coordinates via a `PLACES`
table and aggregates them by city. **When you add a talk in a city that isn't in `PLACES`,
add it there too** — otherwise the talk silently counts as "online" and gets no marker.

`SpeakingMap.astro` renders those cities onto an SVG world map. The map geometry in
`src/lib/world-map.ts` is generated, not hand-written, and has no runtime dependency: it was
produced once from [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth
110m land, public domain) by reprojecting to an equirectangular window, clipping to the
viewport and simplifying the coastlines, then committed as a single 15 KB path. The file
header documents how to regenerate it. Longitudes must be unwrapped before clipping or Fiji
and Eurasia draw stray lines across the whole map.

The markers, chips and detail panel are server-rendered; the script only adds
hover/focus/click behaviour, so the map and city list still work with JavaScript off.

### Design

Dark only. Colours, type and spacing are defined once as `@theme` tokens in
`src/styles/global.css`. There is no `tailwind.config.js` — Tailwind v4 is configured in CSS.

Social cards are generated at build time by `src/pages/og/[...route].ts`.

### Checks

```bash
npm run build && npm run preview          # then, in another shell:
node scripts/interaction-check.mjs        # keyboard, palette, stream, map and a11y assertions
OUT=/tmp/shots node scripts/screenshot.mjs # visual snapshots across pages
```

Both scripts need `npx playwright install chromium`.

## Deploying

Pushes to `master` run `.github/workflows/deploy.yml`: type check, format check, build,
then `actions/deploy-pages`. Pull requests run the same checks via `ci.yml`.

## License

MIT © Craig Loewen
