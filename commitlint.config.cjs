const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const scopesPath = join(__dirname, "commitlint.scopes.json");

/**
 * Commit message rules for the high-speed dashboard app.
 * Scopes are generated automatically from app routes via
 * `pnpm run sync:commit-scopes`.
 * @type {import('@commitlint/types').UserConfig}
 */
let scopeEnum = [
	"api",
	"dashboard",
	"dashboard-api",
	"dashboard-ui",
	"dashboard-data",
	"auth",
	"admin",
	"pwa",
	"integrations",
	"automation",
	"shared",
	"docs",
	"landing",
	"deps",
	"config",
];

try {
	const parsed = JSON.parse(readFileSync(scopesPath, "utf-8"));
	if (Array.isArray(parsed) && parsed.length) {
		scopeEnum = parsed;
	}
} catch {
	// Fallback to defaults above when file missing or invalid.
}

module.exports = {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			[
				"feat",
				"fix",
				"perf",
				"refactor",
				"chore",
				"docs",
				"test",
				"build",
				"ci",
				"revert",
			],
		],
		"scope-enum": [2, "always", scopeEnum],
		"scope-empty": [2, "never"],
		"subject-case": [2, "never", ["pascal-case", "start-case"]],
	},
};

