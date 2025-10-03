/**
 * @typedef {Object} CacheControlOptions
 * @property {"public"|"private"|"no-store"} [cacheability]
 * @property {number} [maxAge]
 * @property {number} [sMaxAge]
 * @property {number} [staleWhileRevalidate]
 */

/**
 * Build a Cache-Control directive string from structured options.
 * @param {CacheControlOptions} [options]
 * @returns {string}
 */
function buildCacheControl(options = {}) {
	const directives = [];
	const cacheability = options.cacheability ?? "public";
	directives.push(cacheability);

	if (typeof options.maxAge === "number") {
		directives.push(`max-age=${Math.max(0, Math.trunc(options.maxAge))}`);
	}

	if (typeof options.sMaxAge === "number") {
		directives.push(`s-maxage=${Math.max(0, Math.trunc(options.sMaxAge))}`);
	}

	if (typeof options.staleWhileRevalidate === "number") {
		directives.push(
			`stale-while-revalidate=${Math.max(0, Math.trunc(options.staleWhileRevalidate))}`,
		);
	}

	return directives.join(", ");
}

module.exports = { buildCacheControl };
