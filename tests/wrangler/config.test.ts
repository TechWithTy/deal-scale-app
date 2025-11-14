import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import TOML from "@iarna/toml";

type WranglerConfig = {
	main?: string;
	assets?: {
		directory?: string;
	};
	build?: {
		command?: string;
		cwd?: string;
		[key: string]: unknown;
	};
	compatibility_date?: string;
	[key: string]: unknown;
};

const wranglerConfig = TOML.parse(
	readFileSync("wrangler.toml", "utf8"),
) as WranglerConfig;

const buildConfig = (wranglerConfig.build ?? {}) as NonNullable<
	WranglerConfig["build"]
>;
const assetsConfig = (wranglerConfig.assets ?? {}) as NonNullable<
	WranglerConfig["assets"]
>;

const hasEntryPoint =
	typeof wranglerConfig.main === "string" &&
	wranglerConfig.main.trim().length > 0;
const hasAssetDirectory =
	typeof assetsConfig.directory === "string" &&
	assetsConfig.directory.trim().length > 0;

const parseCompatibilityDate = () => {
	if (!wranglerConfig.compatibility_date) {
		return null;
	}
	const parsed = Date.parse(wranglerConfig.compatibility_date);
	return Number.isNaN(parsed) ? null : new Date(parsed);
};

describe("wrangler.toml sanity checks", () => {
	it("defines a recent compatibility_date per Cloudflare guidance", () => {
		const compatDate = parseCompatibilityDate();
		expect(compatDate).toBeTruthy();

		if (compatDate) {
			const msInDay = 1000 * 60 * 60 * 24;
			const daysOld = (Date.now() - compatDate.valueOf()) / msInDay;
			// Cloudflare recommends keeping the date reasonably fresh for new APIs.
			expect(daysOld).toBeLessThanOrEqual(400);
		}
	});

	it("provides a build command so Wrangler can produce deployable assets", () => {
		expect(typeof buildConfig.command).toBe("string");
		expect((buildConfig.command ?? "").length).toBeGreaterThan(0);
	});

	it("specifies either a main worker entrypoint or an assets directory", () => {
		expect(hasEntryPoint || hasAssetDirectory).toBe(true);
	});

	it("avoids deprecated build.upload configuration", () => {
		expect("upload" in buildConfig).toBe(false);
	});
});

