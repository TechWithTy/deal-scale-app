module.exports = () => {
  const disableTailwind = process.env.NEXT_DISABLE_TAILWIND === "1";
  const plugins = {
    // pluginName: options (object), or {} if no options
    ...(disableTailwind ? {} : { tailwindcss: {} }),
    autoprefixer: {},
  };
  return { plugins };
};
