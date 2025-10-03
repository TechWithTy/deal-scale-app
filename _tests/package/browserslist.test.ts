import packageJson from "@/package.json";
import { describe, expect, it } from "vitest";

describe("package browserslist targets", () => {
	it("targets only evergreen browsers in production", () => {
		const browsers = packageJson.browserslist?.production ?? [];
		expect(browsers).toContain("last 2 Chrome versions");
		expect(browsers).toContain("last 2 Firefox versions");
		expect(browsers).toContain("last 2 Safari versions");
		expect(browsers).not.toEqual(expect.arrayContaining(["ie 11"]));
	});

	it("keeps development targeting to the current Chrome for fast refresh parity", () => {
		const browsers = packageJson.browserslist?.development ?? [];
		expect(browsers).toEqual([
			"last 1 Chrome version",
			"last 1 Firefox version",
			"last 1 Safari version",
		]);
	});
});
