import QRCode from "qrcode";
import facets from "./src/_data/facets.js";

export default function (eleventyConfig) {
  // Files copied to the website as they are.
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/icons");
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  // ---- How prayer text is turned into HTML -------------------------------

  // Every line break in a prayer file is a line break on the page.
  eleventyConfig.amendLibrary("md", (md) => {
    md.set({ breaks: true, html: true });

    // Each line of a multi-line paragraph becomes its own line on the page, so a
    // line too long for a phone wraps with a hanging indent, as in a psalter.
    // A line written entirely in _italics_ is a rubric (an instruction),
    // printed in red as in the old service books.
    md.core.ruler.push("prayer-lines", (state) => {
      const tokens = state.tokens;
      tokens.forEach((token, i) => {
        if (token.type !== "inline" || !token.children || tokens[i - 1]?.type !== "paragraph_open") return;

        const lines = [[]];
        for (const child of token.children) {
          if (child.type === "softbreak" || child.type === "hardbreak") lines.push([]);
          else lines.at(-1).push(child);
        }

        const info = lines.map((line) => {
          let level = 0;
          const first = line.findIndex((t) => !(t.type === "text" && !t.content.trim()));
          const marker = line[first]?.type === "html_inline" && line[first].content.match(/^<wbr data-indent="(\d)">$/);
          if (marker) { level = Number(marker[1]); line.splice(first, 1); }
          const parts = line.filter((t) => !(t.type === "text" && !t.content.trim()));
          const rubric = parts.length >= 3 && parts[0].type === "em_open" && parts.at(-1).type === "em_close"
            && parts.filter((t) => t.type === "em_open").length === 1;
          if (rubric) parts[0].attrJoin("class", "rubric");
          return { line, level, rubric };
        });

        // A single plain line (ordinary prose) is left as it is.
        if (lines.length === 1 && !info[0].level) { token.children = info[0].line; return; }

        tokens[i - 1].attrJoin("class", "lines");
        const html = (content) => Object.assign(new state.Token("html_inline", "", 0), { content });
        const reopen = (t) => Object.assign(new state.Token(t.type, t.tag, 1), { attrs: t.attrs, markup: t.markup });
        const close = (t) => Object.assign(new state.Token(t.type.replace("_open", "_close"), t.tag, -1), { markup: t.markup });

        // Bold or italics that run across lines are closed and reopened on each line.
        let open = [];
        const children = [];
        for (const { line, level, rubric } of info) {
          const cls = ["line", level && `i${level}`, rubric && "rubric-line"].filter(Boolean).join(" ");
          children.push(html(`<span class="${cls}">`), ...open.map(reopen));
          for (const t of line) {
            children.push(t);
            if (t.nesting === 1) open.push(t);
            if (t.nesting === -1) open.pop();
          }
          children.push(...[...open].reverse().map(close), html("</span>"));
        }
        token.children = children;
      });
    });
  });

  // Leading spaces indent a line: two spaces per step.
  eleventyConfig.addPreprocessor("indentation", "md", (data, content) => {
    return content.replace(/^((?: {2})+)(?![-*+] |\d+\. )(?=\S)/gm, (spaces) => {
      const level = Math.min(3, spaces.length / 2);
      return `<wbr data-indent="${level}">`;
    });
  });

  // ---- Collections ---------------------------------------------------------

  eleventyConfig.addCollection("prayers", (api) =>
    api.getFilteredByGlob("src/prayers/*.md").sort((a, b) => a.data.title.localeCompare(b.data.title))
  );

  eleventyConfig.addCollection("recent", (api) =>
    api.getFilteredByGlob("src/prayers/*.md").sort((a, b) => b.date - a.date)
  );

  // One page for every label: /occasion/marriage/, /kind/litany/, ...
  eleventyConfig.addCollection("facetPages", (api) => {
    const prayers = api.getFilteredByGlob("src/prayers/*.md").sort((a, b) => a.data.title.localeCompare(b.data.title));
    return facets.flatMap((facet) =>
      facetValues(facet, prayers).map((name) => ({
        facet,
        name,
        slug: eleventyConfig.getFilter("slugify")(name),
        description: facet.descriptions[name] || "",
        items: prayers.filter((p) => [].concat(p.data[facet.key] || []).includes(name)),
      }))
    );
  });

  // ---- Filters used by the templates ---------------------------------------

  // All the values of one label, in the preferred order from facets.js.
  eleventyConfig.addFilter("facetValues", (facet, prayers) => facetValues(facet, prayers));

  eleventyConfig.addFilter("facetCount", (name, facet, prayers) =>
    prayers.filter((p) => [].concat(p.data[facet.key] || []).includes(name)).length
  );

  eleventyConfig.addFilter("asList", (value) => [].concat(value || []));

  eleventyConfig.addFilter("head", (list, n) => list.slice(0, n));

  eleventyConfig.addFilter("readableDate", (date) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  );

  // Prayers that share an occasion or season with this one.
  eleventyConfig.addFilter("related", (prayers, url, occasions, seasons) => {
    const labelsOf = (d) => [...[].concat(d.occasions || []), ...[].concat(d.seasons || [])];
    const mine = labelsOf({ occasions, seasons });
    return prayers
      .filter((p) => p.url !== url)
      .map((p) => ({ p, score: labelsOf(p.data).filter((l) => mine.includes(l)).length }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.p);
  });

  // A QR code for a link, drawn as an SVG image.
  eleventyConfig.addFilter("qrSvg", (url) => {
    const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
    const size = qr.modules.size;
    const margin = 2;
    let path = "";
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (qr.modules.get(y, x)) path += `M${x + margin} ${y + margin}h1v1h-1z`;
      }
    }
    const box = size + margin * 2;
    return `<svg class="qr" viewBox="0 0 ${box} ${box}" role="img" aria-label="QR code for ${url}" shape-rendering="crispEdges"><rect width="${box}" height="${box}" fill="#fff"/><path d="${path}" fill="#1d1712"/></svg>`;
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}

function facetValues(facet, prayers) {
  const used = new Set(prayers.flatMap((p) => [].concat(p.data[facet.key] || [])));
  const preferred = facet.order.filter((name) => used.has(name));
  const others = [...used].filter((name) => !facet.order.includes(name)).sort();
  return [...preferred, ...others];
}
