# Prayers & Litanies — pray.wolfmueller.co

Prayers, litanies, and orders of devotion gathered by Pastor Bryan Wolfmueller.

Every prayer is one text file in [`src/prayers/`](src/prayers/). When a change is
pushed to GitHub, the website rebuilds itself and is live in a minute or two.

## Adding a prayer

1. Make a new file in `src/prayers/`. The file name becomes the web address,
   so `prayer-for-advent.md` appears at `pray.wolfmueller.co/prayer-for-advent/`.
   Use lowercase letters and hyphens.
2. Start the file with the labels between two `---` lines, then write the prayer:

```markdown
---
title: "A Prayer for Advent"
date: 2026-11-29
types:
  - Prayer
occasions:
  - Home & Family
seasons:
  - Advent
source: Pastor Wolfmueller
attribution: "Written for the First Sunday in Advent, 2026."
---

_The head of the household prays:_

O Lord, stir up Your power and come,
  that by Your protection we may be rescued from the threatening perils of our sins.
**Amen.**
```

That's all. Commit and push, and it appears on the site, in the right categories, and in search.

## Writing conventions

| You write | It appears as |
|---|---|
| A new line | A new line (no special codes needed) |
| A blank line | A new stanza or paragraph |
| `**Have mercy upon us.**` | **Bold**, for the parts everyone speaks together |
| `_The pastor says:_` (a whole line in italics) | A red rubric, for instructions |
| `_are_` (a word in italics within a line) | Plain italics |
| Two spaces at the start of a line | An indented line (four spaces for twice as far) |
| `## Psalm 127` | A red section heading |
| `---` | A small ✠ divider |

## The labels

- **types**: Prayer, Litany, Liturgy, Rite, Order of Prayer, Devotion, Guide
- **occasions**: Church Service, Home & Family, Marriage, Sickness & Death, Times of Trouble, Nation & Elections, Work & Vocation
- **seasons**: Advent, Christmas, Circumcision & Name of Jesus, New Year, Epiphany, Lent, Holy Week, Easter, Pentecost, Thanksgiving
- **source**: Pastor Wolfmueller, or Historic

A prayer can have several occasions or seasons. A brand-new label (say, `occasions: [Baptism]`)
works right away and gets its own page. To give it a description, add it to
[`src/_data/facets.js`](src/_data/facets.js).

Optional extras: `image: /images/file.jpg` (put the picture in `src/images/`),
`pdf:` a link to a printable version, and `summary:` a sentence for link previews.

## Working on your computer

```bash
npm install      # once, to download the tools
npm start        # preview the site at http://localhost:8080 as you edit
npm run build    # build the finished site (and search index) into _site/
```

## How it fits together

- **Eleventy** turns the prayer files plus the templates in `src/_includes/` into web pages.
- **Pagefind** builds the search index.
- **GitHub Actions** (`.github/workflows/deploy.yml`) runs the build on every push and
  publishes the result to **GitHub Pages**.
- `scripts/import-wordpress.mjs` was used once to bring the prayers over from wolfmueller.co.
