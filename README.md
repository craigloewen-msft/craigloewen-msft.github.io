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
  components/       .astro components, plus three Vue islands
  content/          writing/ and projects/ (Markdown + MDX)
  data/             talks, videos and external posts (YAML)
  layouts/          BaseLayout — head, theme script, header/footer
  lib/              site config, URL helpers, search index
  pages/            file-based routes
  styles/global.css the whole design system (Tailwind v4 @theme tokens)
public/             served as-is: CNAME, resume, legacy /img paths
```

Everything is statically rendered and ships **zero JavaScript** except three Vue islands:

| Island               | Why it needs JS                                   |
| -------------------- | ------------------------------------------------- |
| `CommandPalette.vue` | ⌘K search across every post, talk and project     |
| `TalkExplorer.vue`   | Filter and search 66 talks, videos and articles   |
| `ThemeToggle.vue`    | Dark/light switch, with an inline no-flash script |

### Content

Content is typed with [content collections](https://docs.astro.build/en/guides/content-collections/)
and Zod schemas in `src/content.config.ts`. Adding a post means dropping a Markdown file into
`src/content/writing/`; adding a talk means appending to `src/data/talks.yml`. The schema
will tell you if you get a field wrong.

Post URLs keep the original Jekyll shape — `/blog/:year/:month/:day/:slug/` — so every link
ever shared still resolves. `src/pages/blog/[year]/[month]/[day]/[slug].astro` reconstructs
that path from frontmatter; don't change it without a redirect plan.

### Design

Dark by default, respecting `prefers-color-scheme`, with a manual toggle that persists.
Colours, type and spacing are defined once as `@theme` tokens in `src/styles/global.css`;
light mode flips the same semantic tokens under a `.light` class. There is no
`tailwind.config.js` — Tailwind v4 is configured in CSS.

Social cards are generated at build time by `src/pages/og/[...route].ts`.

### Checks

```bash
npm run build && npm run preview          # then, in another shell:
node scripts/interaction-check.mjs        # keyboard, islands and a11y assertions
OUT=/tmp/shots node scripts/screenshot.mjs # visual snapshots across pages and themes
```

Both scripts need `npx playwright install chromium`.

## Deploying

Pushes to `master` run `.github/workflows/deploy.yml`: type check, format check, build,
then `actions/deploy-pages`. Pull requests run the same checks via `ci.yml`.

## License

MIT © Craig Loewen
