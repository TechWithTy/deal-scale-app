// Minimal PostCSS plugin shim to stand in for TailwindCSS
// when its transitive dependencies are unavailable.
function tailwindcssShim() {
  return {
    postcssPlugin: 'tailwindcss-shim',
    Once() {
      // no-op
    },
  };
}

tailwindcssShim.postcss = true;

module.exports = tailwindcssShim;

