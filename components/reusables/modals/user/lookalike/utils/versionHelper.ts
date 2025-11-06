/**
 * Version Helper Utility
 * Handles lookalike audience version naming and management
 * @module lookalike/utils
 */

/**
 * Generates a versioned lookalike list name
 * Format: "Lookalike - {seedListName} - v0.{version}"
 *
 * @param seedListName - Original seed list name
 * @param version - Version number (1-based)
 * @returns Formatted list name with version
 *
 * @example
 * generateLookalikeListName("Top Investors", 1)
 * // Returns: "Lookalike - Top Investors - v0.01"
 *
 * generateLookalikeListName("High Value Leads", 12)
 * // Returns: "Lookalike - High Value Leads - v0.12"
 */
export function generateLookalikeListName(
	seedListName: string,
	version: number = 1,
): string {
	// Pad version to 2 digits (01, 02, 03, etc.)
	const versionStr = version.toString().padStart(2, "0");
	return `Lookalike - ${seedListName} - v0.${versionStr}`;
}

/**
 * Extracts version number from a lookalike list name
 *
 * @param listName - Full list name with version
 * @returns Version number or null if not found
 *
 * @example
 * extractVersionFromName("Lookalike - Top Investors - v0.03")
 * // Returns: 3
 */
export function extractVersionFromName(listName: string): number | null {
	const match = listName.match(/v0\.(\d+)$/);
	if (!match) return null;
	return parseInt(match[1], 10);
}

/**
 * Finds the next available version number for a seed list
 *
 * @param seedListName - Original seed list name
 * @param existingListNames - Array of existing list names
 * @returns Next available version number
 *
 * @example
 * getNextVersion("Top Investors", [
 *   "Lookalike - Top Investors - v0.01",
 *   "Lookalike - Top Investors - v0.02"
 * ])
 * // Returns: 3
 */
export function getNextVersion(
	seedListName: string,
	existingListNames: string[],
): number {
	const prefix = `Lookalike - ${seedListName} - v0.`;

	// Find all versions for this seed list
	const versions = existingListNames
		.filter((name) => name.startsWith(prefix))
		.map((name) => extractVersionFromName(name))
		.filter((v): v is number => v !== null);

	// Return next version (max + 1, or 1 if none exist)
	return versions.length > 0 ? Math.max(...versions) + 1 : 1;
}

/**
 * Validates if a list name follows the lookalike naming convention
 *
 * @param listName - List name to validate
 * @returns True if valid lookalike name format
 *
 * @example
 * isValidLookalikeListName("Lookalike - Top Investors - v0.01")
 * // Returns: true
 *
 * isValidLookalikeListName("My Custom List")
 * // Returns: false
 */
export function isValidLookalikeListName(listName: string): boolean {
	return /^Lookalike - .+ - v0\.\d{2,}$/.test(listName);
}

/**
 * Gets the seed list name from a lookalike list name
 *
 * @param lookalikeListName - Full lookalike list name
 * @returns Original seed list name or null if invalid format
 *
 * @example
 * getSeedListName("Lookalike - Top Investors - v0.01")
 * // Returns: "Top Investors"
 */
export function getSeedListName(lookalikeListName: string): string | null {
	const match = lookalikeListName.match(/^Lookalike - (.+) - v0\.\d{2,}$/);
	return match ? match[1] : null;
}

/**
 * Increments the version in a lookalike list name
 *
 * @param currentName - Current list name
 * @returns New name with incremented version
 *
 * @example
 * incrementVersion("Lookalike - Top Investors - v0.01")
 * // Returns: "Lookalike - Top Investors - v0.02"
 */
export function incrementVersion(currentName: string): string | null {
	const seedList = getSeedListName(currentName);
	const version = extractVersionFromName(currentName);

	if (!seedList || version === null) return null;

	return generateLookalikeListName(seedList, version + 1);
}

/**
 * Formats version number for display
 *
 * @param version - Version number
 * @returns Formatted version string
 *
 * @example
 * formatVersionNumber(1) // Returns: "v0.01"
 * formatVersionNumber(15) // Returns: "v0.15"
 * formatVersionNumber(100) // Returns: "v0.100"
 */
export function formatVersionNumber(version: number): string {
	const versionStr = version.toString().padStart(2, "0");
	return `v0.${versionStr}`;
}
