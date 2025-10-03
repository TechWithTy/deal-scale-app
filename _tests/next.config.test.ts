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
});
