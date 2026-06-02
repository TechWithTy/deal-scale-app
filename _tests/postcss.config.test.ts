import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface PostCSSConfig {
	plugins: Record<string, unknown>;
}

const loadConfig = () => {
	delete require.cache[require.resolve("../postcss.config.js")];
	return require("../postcss.config.js") as PostCSSConfig;
};

describe("postcss configuration", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("enables tailwindcss in production builds", async () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.resetModules();
		const mod = loadConfig();
		expect(Object.keys(mod.plugins).sort()).toEqual([
			"autoprefixer",
			"tailwindcss",
		]);
	});

	it("keeps tailwindcss enabled when the disable flag is unset", async () => {
		vi.stubEnv("NODE_ENV", "development");
		vi.resetModules();
		const mod = loadConfig();
		expect(Object.keys(mod.plugins).sort()).toEqual([
			"autoprefixer",
			"tailwindcss",
		]);
	});

	it("omits tailwindcss when NEXT_DISABLE_TAILWIND is set", async () => {
		vi.stubEnv("NEXT_DISABLE_TAILWIND", "1");
		vi.resetModules();
		const mod = loadConfig();
		expect(Object.keys(mod.plugins)).toEqual(["autoprefixer"]);
	});

	it("always keeps autoprefixer enabled", async () => {
		const mod = loadConfig();
		expect(mod.plugins).toHaveProperty("autoprefixer");
		expect(mod.plugins).not.toHaveProperty("purgecss");
	});
});
