module.exports = {
  default: [
    // Load TS runtime and path aliases
    "--require-module ts-node/register",
    "--require-module tsconfig-paths/register",
    // Load step definitions
    "--require lib/stores/user/_tests/_features/**/*.ts",
    // Feature files location
    "lib/stores/user/_tests/_features/**/*.feature",
    // UX
    "--publish-quiet",
    "--format progress",
  ].join(" "),
};
