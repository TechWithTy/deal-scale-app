import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

type LoaderModule = {
	default: (args: { src: string; width: number; quality?: number }) => string;
	normalizeSrc: (src: string) => string;
	buildDirectiveString: (args: {
		width?: number;
		quality?: number;
	}) => string;
};

// Helper to load the loader with fresh env vars
async function importLoader(): Promise<LoaderModule> {
	vi.resetModules();
	const mod = await import("../../lib/images/cloudflare-loader.js");
	return {
		default: mod.default,
		normalizeSrc: mod.normalizeSrc,
		buildDirectiveString: mod.buildDirectiveString,
	};
}

describe("Cloudflare image loader", () => {
	const ORIGINAL_ENV = process.env;

	beforeEach(() => {
		process.env = { ...ORIGINAL_ENV };
	});

	afterEach(() => {
		process.env = ORIGINAL_ENV;
	});

	it("returns absolute URLs unchanged", async () => {
		const loader = await importLoader();
		const src = "https://images.unsplash.com/photo.jpg";
		expect(loader.normalizeSrc(src)).toBe(src);
	});

	it("normalizes relative paths using NEXT_PUBLIC_APP_URL", async () => {
		process.env.NEXT_PUBLIC_APP_URL = "https://app.dealscale.io";
		const loader = await importLoader();

		expect(loader.normalizeSrc("/images/avatar.png")).toBe(
			"https://app.dealscale.io/images/avatar.png",
		);
		expect(loader.normalizeSrc("logos/hero.png")).toBe(
			"https://app.dealscale.io/logos/hero.png",
		);
	});

	it("falls back to NEXTAUTH_URL when app url missing", async () => {
		delete process.env.NEXT_PUBLIC_APP_URL;
		process.env.NEXTAUTH_URL = "https://auth.dealscale.io";
		const loader = await importLoader();

		expect(loader.normalizeSrc("/foo")).toBe(
			"https://auth.dealscale.io/foo",
		);
	});

	it("builds directive strings with default quality", async () => {
		const loader = await importLoader();
		expect(
			loader.buildDirectiveString({ width: 320, quality: undefined }),
		).toBe("width=320,quality=75,format=auto,fit=cover");
	});

	it("respects NEXT_IMAGE_DEFAULT_QUALITY override", async () => {
		process.env.NEXT_IMAGE_DEFAULT_QUALITY = "90";
		const loader = await importLoader();

		expect(
			loader.buildDirectiveString({ width: 200, quality: undefined }),
		).toContain("quality=90");
	});

	it("produces /cdn-cgi/image urls for the loader function", async () => {
		process.env.NEXT_PUBLIC_APP_URL = "https://app.dealscale.io";
		const loader = await importLoader();
		const result = loader.default({
			src: "/media/card.png",
			width: 640,
		});
		expect(result).toBe(
			"/cdn-cgi/image/width=640,quality=75,format=auto,fit=cover/https://app.dealscale.io/media/card.png",
		);
	});

	it("throws when src is empty", async () => {
		const loader = await importLoader();
		expect(() => loader.normalizeSrc("")).toThrow(
			"[cloudflare-loader] Received empty image src",
		);
	});
});







