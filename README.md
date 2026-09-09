# craigloewen.com

My personal site — writing, talks and projects. Built with [Astro](https://astro.build),
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
  content/          writing/ and projects/ (Markdown + MDX)
  data/             talks, videos and external posts (YAML)
  layouts/          BaseLayout — head, header/footer
  lib/              site config, URL helpers, content stream, search index
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
`/writing`, the homepage's "Recent work" section and the search index. `/talks` redirects
there.

`ContentStream.astro` renders that whole stream server-side and progressively enhances it
with filter buttons and a search box; the controls stay hidden until the script binds them.

Content is typed with [content collections](https://docs.astro.build/en/guides/content-collections/)
and Zod schemas in `src/content.config.ts`. Adding a post means dropping a Markdown file into
`src/content/writing/`; adding a talk means appending to `src/data/talks.yml`. The schema
will tell you if you get a field wrong.

Post URLs keep the original Jekyll shape — `/blog/:year/:month/:day/:slug/` — so every link
ever shared still resolves. `src/pages/blog/[year]/[month]/[day]/[slug].astro` reconstructs
that path from frontmatter; don't change it without a redirect plan.

### Design

Dark only. Colours, type and spacing are defined once as `@theme` tokens in
`src/styles/global.css`. There is no `tailwind.config.js` — Tailwind v4 is configured in CSS.

Social cards are generated at build time by `src/pages/og/[...route].ts`.

### Checks

```bash
npm run build && npm run preview          # then, in another shell:
node scripts/interaction-check.mjs        # keyboard, palette, stream and a11y assertions
OUT=/tmp/shots node scripts/screenshot.mjs # visual snapshots across pages
```

Both scripts need `npx playwright install chromium`.

## Deploying

Pushes to `master` run `.github/workflows/deploy.yml`: type check, format check, build,
then `actions/deploy-pages`. Pull requests run the same checks via `ci.yml`.

## License

MIT © Craig Loewen
