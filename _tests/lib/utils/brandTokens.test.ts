import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
	applyBrandTokens,
	clearBrandTokens,
	extractBrandColors,
} from "@/lib/utils/brandTokens";

describe("brandTokens", () => {
	beforeEach(() => {
		// Mock document for SSR safety
		if (typeof document === "undefined") {
			global.document = {
				documentElement: {
					style: {
						setProperty: vi.fn(),
						removeProperty: vi.fn(),
					},
				},
			} as any;
		}
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("extractBrandColors", () => {
		it("extracts brand colors from demo config", () => {
			const demoConfig = {
				brandColor: "#ff0000",
				brandColorAccent: "#00ff00",
				brandColorSecondary: "#0000ff",
			};

			const result = extractBrandColors(demoConfig);

			expect(result).toEqual({
				brandPrimary: "#ff0000",
				brandAccent: "#00ff00",
				brandSecondary: "#0000ff",
			});
		});

		it("returns empty object when demo config is undefined", () => {
			const result = extractBrandColors(undefined);
			expect(result).toEqual({});
		});

		it("handles partial brand colors", () => {
			const demoConfig = {
				brandColor: "#ff0000",
			};

			const result = extractBrandColors(demoConfig);

			expect(result).toEqual({
				brandPrimary: "#ff0000",
				brandAccent: undefined,
				brandSecondary: undefined,
			});
		});
	});

	describe("applyBrandTokens", () => {
		it("applies brand colors to CSS variables", () => {
			const setProperty = vi.fn();
			(global.document as any).documentElement.style.setProperty = setProperty;

			const colors = {
				brandPrimary: "#ff0000",
				brandAccent: "#00ff00",
				brandSecondary: "#0000ff",
			};

			applyBrandTokens(colors);

			expect(setProperty).toHaveBeenCalledWith("--brand-primary", "#ff0000");
			expect(setProperty).toHaveBeenCalledWith("--brand-accent", "#00ff00");
			expect(setProperty).toHaveBeenCalledWith("--brand-secondary", "#0000ff");
		});

		it("uses default colors when colors are not provided", () => {
			const setProperty = vi.fn();
			(global.document as any).documentElement.style.setProperty = setProperty;

			applyBrandTokens({});

			expect(setProperty).toHaveBeenCalledWith(
				"--brand-primary",
				"#3b82f6",
			);
			expect(setProperty).toHaveBeenCalledWith("--brand-accent", "#60a5fa");
			expect(setProperty).toHaveBeenCalledWith(
				"--brand-secondary",
				"#1e40af",
			);
		});

		it("handles SSR gracefully when document is undefined", () => {
			const originalDocument = global.document;
			// @ts-expect-error - intentionally removing document for SSR test
			delete global.document;

			expect(() => {
				applyBrandTokens({ brandPrimary: "#ff0000" });
			}).not.toThrow();

			global.document = originalDocument;
		});
	});

	describe("clearBrandTokens", () => {
		it("removes brand color CSS variables", () => {
			const removeProperty = vi.fn();
			(global.document as any).documentElement.style.removeProperty =
				removeProperty;

			clearBrandTokens();

			expect(removeProperty).toHaveBeenCalledWith("--brand-primary");
			expect(removeProperty).toHaveBeenCalledWith("--brand-accent");
			expect(removeProperty).toHaveBeenCalledWith("--brand-secondary");
		});

		it("handles SSR gracefully when document is undefined", () => {
			const originalDocument = global.document;
			// @ts-expect-error - intentionally removing document for SSR test
			delete global.document;

			expect(() => {
				clearBrandTokens();
			}).not.toThrow();

			global.document = originalDocument;
		});
	});
});

