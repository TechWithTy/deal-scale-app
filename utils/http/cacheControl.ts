export type CacheControlOptions = {
	cacheability?: "public" | "private" | "no-store";
	maxAge?: number;
	sMaxAge?: number;
	staleWhileRevalidate?: number;
};

const {
	buildCacheControl: buildCacheControlImpl,
} = require("./cacheControl.js");

/**
 * Build a Cache-Control directive string from structured options.
 */
export function buildCacheControl(options: CacheControlOptions = {}): string {
	return buildCacheControlImpl(options);
}
