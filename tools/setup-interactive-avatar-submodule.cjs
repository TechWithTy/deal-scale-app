#!/usr/bin/env node

const { existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");

const submodulePath = "external/interactive-avatar-nextjs-demo";

if (!existsSync(".gitmodules")) {
	process.exit(0);
}

const result = spawnSync(
	"git",
	["submodule", "update", "--init", "--", submodulePath],
	{ stdio: "inherit" },
);

if (result.status !== 0) {
	console.error(
		`Unable to initialize ${submodulePath}. Configure Vercel with read access to its repository.`,
	);
	process.exit(result.status || 1);
}
