import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const coverageEnabled =
	process.env.CI === "true" || process.env.VITEST_COVERAGE === "1";

export default defineConfig({
	test: {
		environment: "jsdom",
		isolate: true,
		include: [
			"lib/stores/user/_tests/**/*.spec.ts",
			"lib/stores/user/_tests/**/*.spec.tsx",
			"lib/stores/user/_tests/**/*.test.ts",
			"lib/stores/user/_tests/**/*.test.tsx",
			"lib/utils/**/*.spec.ts",
			"lib/utils/**/*.spec.tsx",
			"lib/utils/**/*.test.ts",
			"lib/utils/**/*.test.tsx",
			"_tests/**/*.spec.ts",
			"_tests/**/*.spec.tsx",
			"_tests/**/*.test.ts",
			"_tests/**/*.test.tsx",
			"tests/**/*.spec.ts",
			"tests/**/*.spec.tsx",
			"tests/**/*.test.ts",
			"tests/**/*.test.tsx",
			"tests/pwa/**/*.spec.ts",
			"tests/pwa/**/*.test.ts",
		],
		setupFiles: ["lib/stores/user/_tests/_steps/setup.ts"],
	},
	resolve: {
		alias: {
			"@": path.resolve(rootDir, "."),
			"@root": path.resolve(rootDir, "."),
			external: path.resolve(rootDir, "external"),
			"@external/dynamic-hero": path.resolve(
				rootDir,
				"external/dynamic-hero/src",
			),
			react: path.resolve(rootDir, "node_modules/react"),
			"react-dom": path.resolve(rootDir, "node_modules/react-dom"),
			"react/jsx-runtime": path.resolve(
				rootDir,
				"node_modules/react/jsx-runtime",
			),
		},
	},
	coverage: {
		enabled: coverageEnabled,
		provider: "v8",
		reportsDirectory: path.resolve(
			rootDir,
			"reports",
			"tests",
			"coverage",
			"latest",
		),
		reporter: ["text", "json-summary", "lcov"],
		clean: true,
		exclude: ["**/node_modules/**", "**/.next/**", "vitest.config.ts"],
	},
});
