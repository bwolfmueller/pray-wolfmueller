// One-time import of the prayers from wolfmueller.co (WordPress) into Markdown files.
//
// Usage: npm run import
//
// It downloads each page from the WordPress REST API, turns the HTML into
// Markdown (keeping bold responses, italics, indentation and headings),
// and writes one file per prayer into src/prayers/.
// Existing files are NOT overwritten, so hand edits are safe.

import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import sharp from "sharp";

const WP = "https://wolfmueller.co/wp-json/wp/v2";
const OUT = "src/prayers";
const IMAGES = "src/images";
const UA = { headers: { "User-Agent": "Mozilla/5.0 (pray.wolfmueller.co importer)" } };

// Which WordPress page becomes which prayer, and how it is labeled.
const PRAYERS = [
  {
    wp: "litany", slug: "the-litany", title: "The Litany",
    types: ["Litany"], occasions: ["Church Service", "Times of Trouble"], source: "Historic",
    attribution: "Martin Luther, from The Lutheran Hymnal (#661). Translator unknown.",
    image: "KYRIE",
  },
  {
    wp: "litanysuffering", slug: "litany-for-the-sick-and-suffering", title: "Litany for the Sick & Suffering",
    types: ["Litany"], occasions: ["Sickness & Death", "Times of Trouble"], source: "Pastor Wolfmueller",
    attribution: "Adapted from Luther’s Litany, The Lutheran Hymnal (#661).",
    image: "DALL·E-2024-01-16",
  },
  {
    wp: "entrance-departure-prayers", slug: "entrance-and-departure-prayers", title: "Entrance & Departure Prayers",
    types: ["Prayer"], occasions: ["Church Service"], source: "Historic",
    attribution: "From the churches of Denmark.",
  },
  {
    wp: "a-simple-order-of-prayer-for-couples", slug: "a-simple-order-of-prayer-for-couples", title: "A Simple Order of Prayer for Couples",
    types: ["Order of Prayer"], occasions: ["Marriage", "Home & Family"], source: "Pastor Wolfmueller",
  },
  {
    wp: "homeblessing", slug: "blessing-a-house", title: "Blessing a House",
    types: ["Rite"], occasions: ["Home & Family"], source: "Pastor Wolfmueller",
    attribution: "Adapted from Pastoral Care (Openbook, 1998) and the Pastoral Care Companion (CPH).",
    image: "house with angels",
  },
  {
    wp: "thanksgiving-family-devotion-2-2", slug: "thanksgiving-family-devotion", title: "Thanksgiving Family Devotion",
    types: ["Devotion"], occasions: ["Home & Family"], seasons: ["Thanksgiving"], source: "Pastor Wolfmueller",
    attribution: "Prepared by Pastor Wolfmueller and Pastor Flamme.",
    pdf: "https://wolfmueller.co/wp-content/uploads/2016/11/Thanksgiving-Family-Devotion-1.pdf",
  },
  {
    wp: "liturgychristmasgifts", slug: "a-short-liturgy-before-opening-christmas-gifts", title: "A Short Liturgy Before Opening Christmas Gifts",
    types: ["Liturgy"], occasions: ["Home & Family"], seasons: ["Christmas"], source: "Pastor Wolfmueller",
    pdf: "https://wolfmueller.co/wp-content/uploads/2023/12/A-SHORT-LITURGY-BEFORE-OPENING-CHRISTMAS-GIFTS.pdf",
  },
  {
    wp: "rite-of-engagement-and-blessing-of-the-couple", slug: "rite-of-engagement", title: "Rite of Engagement (and Blessing of the Couple)",
    types: ["Rite"], occasions: ["Marriage"], source: "Pastor Wolfmueller",
  },
  {
    wp: "friendofbrideandgroom", slug: "a-short-liturgy-for-the-friends-of-the-bride-and-groom", title: "A Short Liturgy for the Friends of the Bride and the Friends of the Groom Before the Wedding",
    types: ["Liturgy"], occasions: ["Marriage"], source: "Pastor Wolfmueller",
    pdf: "https://wolfmueller.co/wp-content/uploads/2024/11/Friends-of-Bride-and-Groom-booklet.pdf",
    image: "Church Wedding",
  },
  {
    wp: "votingprayer", slug: "a-prayer-before-and-after-voting", title: "A Prayer Before and After Casting a Vote",
    types: ["Prayer"], occasions: ["Nation & Elections"], source: "Pastor Wolfmueller",
  },
  {
    wp: "prayerbeforeelection", slug: "prayers-for-the-night-before-an-election", title: "Prayers for the Home for the Night Before Elections",
    types: ["Prayer"], occasions: ["Nation & Elections", "Home & Family"], source: "Pastor Wolfmueller",
  },
  {
    wp: "electionlitany", slug: "litany-for-election-night", title: "Litany for Election Night",
    types: ["Litany"], occasions: ["Nation & Elections"], source: "Pastor Wolfmueller",
    attribution: "Adapted from Luther’s Litany, The Lutheran Hymnal (#661).",
  },
  {
    wp: "five-things-deathbed-loved-one", slug: "five-things-to-do-at-the-deathbed", title: "Five Things to Do at the Deathbed of a Loved One",
    types: ["Guide"], occasions: ["Sickness & Death"], source: "Pastor Wolfmueller",
  },
  {
    wp: "christmas-prayer", slug: "christmas-prayer", title: "Christmas Prayer: The Nativity",
    types: ["Prayer"], seasons: ["Christmas"], source: "Historic",
    attribution: "From The Lutheran Liturgy, the companion to The Lutheran Hymnal.",
  },
  {
    wp: "liturgy-for-the-right-use-of-technology", slug: "liturgy-for-the-right-use-of-technology", title: "Liturgy for the Right Use of Technology",
    types: ["Liturgy"], occasions: ["Work & Vocation"], source: "Pastor Wolfmueller",
    attribution: "Written for the Digital Catacombs Conference, Austin, Texas (2024).",
    image: "DALL·E 2024-07-26",
  },
  {
    wp: "loehes-prayer-at-the-first-shedding-of-jesus-blood", slug: "prayer-at-the-first-shedding-of-jesus-blood", title: "Prayer at the First Shedding of Jesus’ Blood",
    types: ["Prayer"], seasons: ["Circumcision & Name of Jesus"], source: "Historic",
    attribution: "Wilhelm Löhe, Seed-Grains of Prayer, no. 269.",
  },
  {
    wp: "prayer-for-the-new-year", slug: "prayer-for-the-new-year", title: "Prayer for the New Year",
    types: ["Prayer"], seasons: ["New Year"], source: "Historic",
    attribution: "From The Lutheran Liturgy, the companion to The Lutheran Hymnal.",
  },
];

// Paragraphs that only made sense on WordPress (QR captions, cross-links, download links).
const DROP = [
  /^(use this qr code|scan (here|this code|to share))/i,
  /^more election prayers/i,
  /^download (the pdf|a pdf|.*booklet)/i,
  /^a-short-liturgy-before-opening-christmas-giftsdownload/i,
];

const SMALL_WORDS = new Set("a an and as at but by for from in into nor of on or the to with".split(" "));

function titleCase(s) {
  return s.toLowerCase().split(" ").map((w, i) =>
    i > 0 && SMALL_WORDS.has(w) ? w : w.replace(/\p{L}/u, (c) => c.toUpperCase())
  ).join(" ");
}

function escapeMd(text) {
  return text.replace(/([*_\\`])/g, "\\$1");
}

// Turn the inline contents of a block element into a list of lines.
// Each line is a list of { text, bold, italic } runs.
function inlineToLines($, el) {
  const lines = [[]];
  const walk = (node, marks) => {
    if (node.type === "text") {
      lines.at(-1).push({ text: node.data.replace(/\u00a0/g, " ").replace(/\n/g, " "), ...marks });
      return;
    }
    if (node.type !== "tag") return;
    const tag = node.name;
    if (tag === "br") { lines.push([]); return; }
    if (tag === "img" || tag === "script" || tag === "style") return;
    const next = { ...marks };
    if (tag === "strong" || tag === "b") next.bold = true;
    if (tag === "em" || tag === "i") next.italic = true;
    if (tag === "a") next.href = $(node).attr("href");
    for (const child of node.children) walk(child, next);
  };
  for (const child of el.children) walk(child, {});
  return lines;
}

// Render one line of runs into Markdown, with indentation from leading spaces.
function renderLine(runs) {
  // Merge neighboring runs that share the same formatting.
  const merged = [];
  for (const r of runs) {
    const prev = merged.at(-1);
    if (prev && !!prev.bold === !!r.bold && !!prev.italic === !!r.italic && prev.href === r.href) prev.text += r.text;
    else merged.push({ ...r });
  }
  const raw = merged.map((r) => r.text).join("");
  const leading = raw.match(/^ */)[0].length;
  const indent = leading === 0 ? 0 : Math.min(3, Math.ceil(leading / 3));

  if (merged.length) {
    merged[0].text = merged[0].text.replace(/^ +/, "");
    merged.at(-1).text = merged.at(-1).text.replace(/ +$/, "");
  }

  // Keep surrounding spaces outside the markers so Markdown recognizes them.
  const wrap = (text, mark) => {
    if (!text.trim()) return text ? " " : "";
    const [, pre, core, post] = text.match(/^(\s*)(.*?)(\s*)$/s);
    return pre + mark + core + mark + post;
  };

  // Group neighboring runs by bold/link, so "**So _are_ the children**" stays one bold span.
  const groups = [];
  for (const r of merged) {
    const prev = groups.at(-1);
    if (prev && (!r.text.trim() || (!!prev.bold === !!r.bold && prev.href === r.href))) prev.runs.push(r);
    else groups.push({ bold: r.bold, href: r.href, runs: [r] });
  }
  let out = "";
  for (const g of groups) {
    let md = g.runs.map((r) => (r.italic ? wrap(escapeMd(r.text), "_") : escapeMd(r.text))).join("");
    if (g.bold) md = wrap(md, "**");
    if (g.href && md.trim()) md = `[${md.trim()}](${g.href})`;
    out += md;
  }
  out = out.replace(/ {2,}/g, " ").trim();
  // Escape characters that would otherwise start a list or heading.
  out = out.replace(/^(#|>|[-+] |\d+\. )/, "\\$1");
  return "  ".repeat(indent) + out;
}

function isHeadingLine(runs) {
  const text = runs.map((r) => r.text).join("").trim();
  const allBold = runs.every((r) => !r.text.trim() || r.bold);
  return text.length > 0 && text.length <= 60 && allBold && text === text.toUpperCase() && /[A-Z]/.test(text);
}

async function fetchPage(slug) {
  for (const type of ["pages", "posts"]) {
    const res = await fetch(`${WP}/${type}?slug=${slug}&_fields=date,modified,link,content`, UA);
    const data = await res.json();
    if (data.length) return data[0];
  }
  throw new Error(`Not found on WordPress: ${slug}`);
}

async function saveImage(url, slug) {
  const file = `${slug}.jpg`;
  const res = await fetch(url, UA);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(IMAGES, file));
  return `/images/${file}`;
}

function frontMatter(p, page, image) {
  const list = (key, values) => (values?.length ? `${key}:\n${values.map((v) => `  - ${v}`).join("\n")}\n` : "");
  return (
    "---\n" +
    `title: "${p.title.replace(/"/g, '\\"')}"\n` +
    `date: ${page.date.slice(0, 10)}\n` +
    list("types", p.types) +
    list("occasions", p.occasions) +
    list("seasons", p.seasons) +
    `source: ${p.source}\n` +
    (p.attribution ? `attribution: "${p.attribution}"\n` : "") +
    (image ? `image: ${image}\n` : "") +
    (p.pdf ? `pdf: ${p.pdf}\n` : "") +
    `original: ${page.link}\n` +
    "---\n"
  );
}

async function importPrayer(p) {
  const file = path.join(OUT, `${p.slug}.md`);
  try {
    await fs.access(file);
    console.log(`skip   ${file} (already exists)`);
    return;
  } catch {}

  const page = await fetchPage(p.wp);
  const $ = cheerio.load(page.content.rendered);
  const blocks = [];
  let image;

  const convert = async (elements) => {
  for (const el of elements) {
    const $el = $(el);
    const tag = el.name;

    // Blockquotes and wrappers that hold whole paragraphs: convert what is inside.
    if ((tag === "blockquote" || tag === "div") && $el.children("p, ul, ol, h1, h2, h3, h4, blockquote").length) {
      await convert($el.children().toArray());
      continue;
    }

    if (tag === "hr") { blocks.push("---"); continue; }

    if ($el.find("img").length && !$el.text().trim().replace(/use this qr.*|scan.*/i, "").trim()) {
      const title = $el.find("img").attr("data-image-title") || "";
      if (p.image && title.startsWith(p.image)) {
        const src = $el.find("img").attr("data-orig-file").split("?")[0].replace("i0.wp.com/", "");
        image = await saveImage(src, p.slug);
      }
      continue;
    }

    if (/^h[1-6]$/.test(tag)) {
      const text = $el.text().trim();
      if (text) blocks.push(`## ${titleCase(text)}`);
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const items = $el.children("li").toArray().map((li, i) => {
        const line = inlineToLines($, li).map(renderLine).filter(Boolean).join(" ");
        return tag === "ul" ? `- ${line}` : `${i + 1}. ${line}`;
      });
      blocks.push(items.join("\n"));
      continue;
    }

    if (tag === "p" || tag === "blockquote" || tag === "div" || tag === "figure") {
      let lines = inlineToLines($, el).filter((runs) => runs.some((r) => r.text.trim()));
      if (!lines.length) continue;
      const plain = lines.map((runs) => runs.map((r) => r.text).join("")).join(" ").trim();
      if (DROP.some((re) => re.test(plain))) continue;

      // An ALL-CAPS bold first line ("GREETING", "PSALM 127") becomes a section heading.
      if (isHeadingLine(lines[0])) {
        blocks.push(`## ${titleCase(lines[0].map((r) => r.text).join("").trim())}`);
        lines = lines.slice(1);
        if (!lines.length) continue;
      }
      const md = lines.map(renderLine).join("\n").replace(/\*\*\*\*/g, "");
      // Some WordPress text has literal **name** placeholders; show them as italics.
      blocks.push(md.replace(/\\\*\\\*(.+?)\\\*\\\*/g, "_$1_"));
    }
  }
  };
  await convert($("body").children().toArray());

  const body = blocks.join("\n\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  await fs.writeFile(file, frontMatter(p, page, image) + "\n" + body, "utf8");
  console.log(`wrote  ${file}${image ? " (+ image)" : ""}`);
}

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(IMAGES, { recursive: true });
for (const p of PRAYERS) await importPrayer(p);
