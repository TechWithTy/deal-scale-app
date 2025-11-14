/**
 * Cloudflare Image Resizing loader for Next.js.
 * This runs server-side (via next.config.js -> images.loaderFile) and rewrites
 * each image request to Cloudflare's /cdn-cgi/image endpoint while preserving
 * the default Next.js domains/device sizes behavior.
 */
const ABSOLUTE_URL_REGEX = /^https?:\/\//i;
const FALLBACK_BASE_URL =
	process.env.NEXT_PUBLIC_APP_URL ||
	process.env.NEXTAUTH_URL ||
	"http://localhost:3000";
const DEFAULT_QUALITY = Number.parseInt(
	process.env.NEXT_IMAGE_DEFAULT_QUALITY || "75",
	10,
);

/**
 * Ensure every src we receive is absolute so Cloudflare can fetch it.
 * Remote URLs are passed through untouched. Relative paths are resolved
 * against NEXT_PUBLIC_APP_URL (or NEXTAUTH_URL as a final fallback).
 */
function normalizeSrc(src) {
	if (!src) {
		throw new Error("[cloudflare-loader] Received empty image src");
	}

	if (ABSOLUTE_URL_REGEX.test(src)) {
		return src;
	}

	const normalizedPath = src.startsWith("/") ? src : `/${src}`;
	return new URL(normalizedPath, FALLBACK_BASE_URL).toString();
}

/**
 * Build the Cloudflare directive string (width, quality, format, fit, etc.)
 */
function buildDirectiveString({ width, quality }) {
	const size = Math.max(1, Math.round(width || 0));
	const directives = [
		`width=${size}`,
		`quality=${quality || DEFAULT_QUALITY || 75}`,
		"format=auto",
		"fit=cover",
	];

	return directives.join(",");
}

module.exports = function cloudflareImageLoader({ src, width, quality }) {
	const normalizedSrc = normalizeSrc(src);
	const directives = buildDirectiveString({ width, quality });
	return `/cdn-cgi/image/${directives}/${normalizedSrc}`;
};

module.exports.normalizeSrc = normalizeSrc;
module.exports.buildDirectiveString = buildDirectiveString;
