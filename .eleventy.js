module.exports = function(eleventyConfig) {
  // Copy assets directly to output
  eleventyConfig.addPassthroughCopy("main.js");
  eleventyConfig.addPassthroughCopy("netlify.toml");

  // Apply `base.njk` layout to all HTML/Nunjucks files automatically
  eleventyConfig.addGlobalData("layout", "base");

  return {
    dir: {
      input: ".",
      includes: "_includes",  // for partials like header/footer
      layouts: "_layouts",    // for main page layouts
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
