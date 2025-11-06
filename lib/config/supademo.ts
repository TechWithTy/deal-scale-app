export type SupademoRouteMap = Record<string, { id: string; label?: string }>;

/**
 * Default Supademo route-to-demo mapping.
 * Keys are pathname prefixes; the first matching prefix wins.
 */
export const DEFAULT_SUPADEMO_ROUTE_MAP: SupademoRouteMap = {
	"/dashboard/campaigns": {
		id: "cmhjlwt7i0jk4u1hm0scmf39w",
		label: "Create & Launch Campaigns",
	},
	"/dashboard/lead": {
		id: "cmhjlwt7i0jk4u1hm0scmf39w",
		label: "Import & Manage Leads",
	},
	"/dashboard": {
		id: "cmhjlwt7i0jk4u1hm0scmf39w",
		label: "QuickStart Overview",
	},
};

/**
 * Finds a Supademo id for a given pathname using a prefix match.
 */
export function resolveSupademoIdForPath(
	pathname: string,
	routeMap: SupademoRouteMap = DEFAULT_SUPADEMO_ROUTE_MAP,
): { id: string; label?: string } | null {
	const entries = Object.entries(routeMap);
	// Sort by longest prefix first to prioritize deeper matches
	entries.sort((a, b) => b[0].length - a[0].length);
	for (const [prefix, info] of entries) {
		if (pathname.startsWith(prefix)) return info;
	}
	return null;
}
