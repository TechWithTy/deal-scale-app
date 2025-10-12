import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Type declaration for the PostCSS config module
interface PostCSSConfig {
	plugins: unknown[];
	createPurgeCssPlugin: () => unknown;
	purgeCssContentGlobs: string[];
}

describe("postcss configuration", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("enables the purgecss plugin in production builds", async () => {
		vi.stubEnv("NODE_ENV", "production");
		// Reload the module to pick up the new env var
		vi.resetModules();
		const mod = require("../../postcss.config.js") as PostCSSConfig;
		const config = mod as { plugins: unknown[] };

		const pluginNames = config.plugins
			.map((plugin) => {
				if (plugin && typeof plugin === "object" && "postcssPlugin" in plugin) {
					return (plugin as { postcssPlugin: string }).postcssPlugin;
				}

				if (typeof plugin === "function" && "postcssPlugin" in plugin) {
					return (plugin as { postcssPlugin: string }).postcssPlugin;
				}

				return null;
			})
			.filter(Boolean);

		expect(pluginNames).toContain("postcss-purgecss");
	});

	it("omits purgecss outside production to preserve DX", async () => {
		vi.stubEnv("NODE_ENV", "development");
		// Reload the module to pick up the new env var
		vi.resetModules();
		const mod = require("../../postcss.config.js") as PostCSSConfig;
		const config = mod as { plugins: unknown[] };

		const pluginNames = config.plugins
			.map((plugin) => {
				if (plugin && typeof plugin === "object" && "postcssPlugin" in plugin) {
					return (plugin as { postcssPlugin: string }).postcssPlugin;
				}

				if (typeof plugin === "function" && "postcssPlugin" in plugin) {
					return (plugin as { postcssPlugin: string }).postcssPlugin;
				}

				return null;
			})
			.filter(Boolean);

		expect(pluginNames).not.toContain("postcss-purgecss");
	});

	it("documents the purgecss glob coverage for audits", async () => {
		const mod = require("../../postcss.config.js") as PostCSSConfig;
		const purgeGlobs = mod.purgeCssContentGlobs as string[];
		expect(purgeGlobs).toEqual(
			expect.arrayContaining([
				expect.stringContaining("app/"),
				expect.stringContaining("components/"),
				expect.stringContaining("utils/"),
			]),
		);
	});
});
