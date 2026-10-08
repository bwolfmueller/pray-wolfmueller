# pray.wolfmueller.co

Pastor Bryan Wolfmueller's prayer site: an Eleventy static site published to GitHub Pages
(repo `bwolfmueller/pray-wolfmueller`, custom domain via a Bluehost CNAME `pray` → `bwolfmueller.github.io`).
Pushing to `main` rebuilds and publishes automatically (`.github/workflows/deploy.yml`).

## Working with Bryan

- He is learning how this works. Walk through each step and end with "Does that make sense?"
- Give him the commands to run (one per code block) rather than running git commands for him,
  unless he asks you to. No explanation needed unless he asks for one.
- He usually adds prayers by pasting the text into chat. Turn it into a prayer file, preview it,
  then give him the commit/push commands.

## Adding a prayer

One Markdown file per prayer in `src/prayers/`; the file name is the URL slug. Conventions
(see README.md for the full table):

- Every line break is a line break; a blank line starts a new stanza.
- `**bold**` = spoken by all. A line entirely in `_italics_` = red rubric. Two leading spaces = one indent step.
- `## Heading` = red section heading. `---` = ✠ divider.
- Front matter: `title`, `date`, `types`, `occasions`, `seasons`, `source` (`Pastor Wolfmueller` or `Historic`),
  optional `attribution`, `image`, `pdf`, `summary`. Label names and descriptions live in `src/_data/facets.js`.
- Keep his wording exactly; point out typos rather than silently fixing them.

## Commands

- `npm start` — local preview at http://localhost:8080 (search needs `npm run build` first)
- `npm run build` — build `_site/` and the Pagefind search index
