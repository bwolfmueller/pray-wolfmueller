// Settings shared by every page of the Comfort Book.
export default {
  layout: "layouts/comfort.njk",
  bodyClass: "prayer-page comfort-page",
  permalink: (data) => `/comfort-book/${data.page.fileSlug}/`,
  eleventyComputed: {
    summary: (data) => data.summary || [data.subtitle, data.attribution].filter(Boolean).join(" · ") || "From the Comfort Book",
  },
};
