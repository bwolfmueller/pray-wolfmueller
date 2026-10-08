// Settings shared by every prayer in this folder.
export default {
  layout: "layouts/prayer.njk",
  permalink: (data) => `/${data.page.fileSlug}/`,
  eleventyComputed: {
    summary: (data) => data.summary || data.attribution || "",
  },
};
