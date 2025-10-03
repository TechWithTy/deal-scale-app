<<<<<<< ours
import { describe, expect, it } from "vitest";
import config from "@/next.config";

describe("next.config headers", () => {
        it("includes the security headers recommended by lighthouse", async () => {
                const headers = await config.headers?.();
                const rootHeaders = headers?.find((entry) => entry.source === "/(.*)");
                expect(rootHeaders).toBeDefined();
                const names = new Set(rootHeaders?.headers.map((header) => header.key));
                expect(names.has("Content-Security-Policy")).toBe(true);
                expect(names.has("Strict-Transport-Security")).toBe(true);
                expect(names.has("X-Content-Type-Options")).toBe(true);
                expect(names.has("Referrer-Policy")).toBe(true);
                expect(names.has("Permissions-Policy")).toBe(true);
        });
=======
import config from "@/next.config";
import { describe, expect, it } from "vitest";

describe("next.config", () => {
	it("includes the security headers recommended by lighthouse", async () => {
		const headers = await config.headers?.();
		const rootHeaders = headers?.find((entry) => entry.source === "/(.*)");
		expect(rootHeaders).toBeDefined();
		const names = new Set(rootHeaders?.headers.map((header) => header.key));
		expect(names.has("Content-Security-Policy")).toBe(true);
		expect(names.has("Strict-Transport-Security")).toBe(true);
		expect(names.has("X-Content-Type-Options")).toBe(true);
		expect(names.has("Referrer-Policy")).toBe(true);
		expect(names.has("Permissions-Policy")).toBe(true);
	});

	it("adds an aggressive cache policy for the marketing shell", async () => {
		const headers = await config.headers?.();
		const marketingHeaders = headers?.find((entry) => entry.source === "/");
		expect(marketingHeaders).toBeDefined();
		const cacheDirective = marketingHeaders?.headers.find(
			(header) => header.key === "Cache-Control",
		);
		expect(cacheDirective?.value).toContain("s-maxage=");
		expect(cacheDirective?.value).toContain("stale-while-revalidate");
	});

	it("enables modern bundling optimizations", () => {
		expect(config.experimental?.optimizePackageImports).toBeDefined();
		expect(Array.isArray(config.experimental?.optimizePackageImports)).toBe(
			true,
		);
		expect(config.compiler?.removeConsole).toBe(true);
		expect(config.compiler?.reactRemoveProperties).toBe(true);
	});
>>>>>>> theirs
});
