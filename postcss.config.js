const disableTailwind = process.env.NEXT_DISABLE_TAILWIND === "1";
module.exports = {
  plugins: {
    // pluginName: options (object), or {} if no options
    ...(disableTailwind ? {} : { tailwindcss: {} }),
    autoprefixer: {},
  },
};
