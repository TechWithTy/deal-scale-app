import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	test: {
		environment: "jsdom",
		isolate: true,
		include: [
			"lib/stores/user/_tests/**/*.spec.ts",
			"lib/stores/user/_tests/**/*.spec.tsx",
			"lib/stores/user/_tests/**/*.test.ts",
			"lib/stores/user/_tests/**/*.test.tsx",
			"_tests/**/*.spec.ts",
			"_tests/**/*.spec.tsx",
			"_tests/**/*.test.ts",
			"_tests/**/*.test.tsx",
			"tests/**/*.spec.ts",
			"tests/**/*.spec.tsx",
			"tests/**/*.test.ts",
			"tests/**/*.test.tsx",
		],
		setupFiles: ["lib/stores/user/_tests/_steps/setup.ts"],
	},
	resolve: {
		alias: {
			"@": path.resolve(rootDir, "."),
			"@root": path.resolve(rootDir, "."),
			external: path.resolve(rootDir, "external"),
		},
	},
});
