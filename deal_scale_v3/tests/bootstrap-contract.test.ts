import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");

function read(relativePath: string) {
	return readFileSync(join(root, relativePath), "utf8");
}

describe("Deal Scale Twenty app bootstrap", () => {
	it("declares the Deal Scale application identity", () => {
		const config = read("src/application-config.ts");
		const identifiers = read("src/constants/universal-identifiers.ts");

		expect(identifiers).toContain("Deal Scale");
		expect(config).not.toContain("My Twenty App");
		expect(identifiers).toMatch(/APPLICATION_UNIVERSAL_IDENTIFIER\s*=\s*[\"'][0-9a-f-]{36}[\"']/i);
	});

	it("documents the reuse and licensing boundary without secrets", () => {
		const readme = read("README.md");
		const envExample = read(".env.example");

		expect(readme).toMatch(/Twenty/i);
		expect(readme).toMatch(/license|licensing/i);
		expect(readme).toMatch(/Deal Scale.*proprietary|proprietary.*Deal Scale/i);
		expect(envExample).not.toMatch(/(sk-|secret|password|token)\s*[:=]\s*[^#\r\n]+/i);
	});

	it("keeps the application manifest stable for a no-op second sync", () => {
		const config = read("src/application-config.ts");
		const identifiers = read("src/constants/universal-identifiers.ts");

		expect(config).toContain("APPLICATION_UNIVERSAL_IDENTIFIER");
		expect(identifiers).toContain("APPLICATION_UNIVERSAL_IDENTIFIER");
		expect(identifiers).toMatch(/APPLICATION_UNIVERSAL_IDENTIFIER\s*=\s*[\"'][0-9a-f-]{36}[\"']/i);
	});
});
