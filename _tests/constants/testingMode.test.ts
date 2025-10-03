import { describe, expect, it } from "vitest";
import { resolveAppTestingMode } from "@/constants/testingMode";

describe("resolveAppTestingMode", () => {
        it("returns dev for dev input", () => {
                expect(resolveAppTestingMode("dev")).toBe("dev");
        });

        it("returns alpha for alpha input", () => {
                expect(resolveAppTestingMode("ALPHA")).toBe("alpha");
        });

        it("treats true-like values as dev", () => {
                expect(resolveAppTestingMode("true")).toBe("dev");
                expect(resolveAppTestingMode("1")).toBe("dev");
        });

        it("treats falsy values as off", () => {
                expect(resolveAppTestingMode("false")).toBe("off");
                expect(resolveAppTestingMode(undefined)).toBe("off");
        });

        it("ignores unknown values and falls back to off", () => {
                expect(resolveAppTestingMode("unknown")).toBe("off");
        });
});
