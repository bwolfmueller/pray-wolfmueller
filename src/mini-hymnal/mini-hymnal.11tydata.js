// Settings shared by every page of the Mini Hymnal.
export default {
  layout: "layouts/hymnal.njk",
  bodyClass: "prayer-page hymnal-page",
  permalink: (data) => `/mini-hymnal/${data.page.fileSlug}/`,
  eleventyComputed: {
    summary: (data) => data.summary || [data.subtitle, data.attribution].filter(Boolean).join(" · ") || "From the Mini Hymnal",
  },
};
