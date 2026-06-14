import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const layoutPath = path.join(process.cwd(), "app", "layout.tsx");

describe("Root layout dev chunk recovery", () => {
	it("clears stale localhost PWA caches before app hydration", () => {
		const source = readFileSync(layoutPath, "utf8");

		expect(source).toContain("developmentChunkRecoveryScript");
		expect(source).toContain('id="dev-chunk-recovery"');
		expect(source).toContain('strategy="beforeInteractive"');
		expect(source).toContain("serviceWorker");
		expect(source).toContain("getRegistrations()");
		expect(source).toContain("registration.unregister()");
		expect(source).toContain("caches.keys()");
		expect(source).toContain("caches.delete(key)");
		expect(source).toContain("Node.prototype.removeChild");
		expect(source).toContain("Node.prototype.insertBefore");
		expect(source).toContain("child.parentNode !== this");
		expect(source).toContain("before.parentNode !== this");
		expect(source).toContain("__dealScaleSafeRemoveChild");
		expect(source).toContain("ChunkLoadError");
		expect(source).toContain("app\\\\/layout\\\\.js");
		expect(source).toContain("window.location.reload()");
	});
});
