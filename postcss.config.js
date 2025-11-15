const disableTailwind = process.env.NEXT_DISABLE_TAILWIND === "1";
const plugins = { autoprefixer: {} };
if (!disableTailwind) {
  try {
    // Ensure Tailwind and its known transitive dependency resolve before enabling
    require.resolve("@alloc/quick-lru");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("tailwindcss");
    plugins["tailwindcss"] = {};
  } catch (_) {
    // Omit tailwindcss to avoid build-time resolution errors
  }
}

module.exports = { plugins };
