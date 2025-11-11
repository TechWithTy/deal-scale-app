/**
 * Brand token utilities for dynamically injecting CSS variables
 * from user profile brand colors.
 */

export interface BrandColors {
	brandPrimary?: string;
	brandAccent?: string;
	brandSecondary?: string;
}

const DEFAULT_BRAND_PRIMARY = "#3b82f6"; // blue-500
const DEFAULT_BRAND_ACCENT = "#60a5fa"; // blue-400
const DEFAULT_BRAND_SECONDARY = "#1e40af"; // blue-800

/**
 * Applies brand colors to CSS custom properties on the document root.
 * These can then be used in Tailwind via var(--brand-primary), etc.
 */
export function applyBrandTokens(colors: BrandColors): void {
	if (typeof document === "undefined") return;

	const root = document.documentElement;
	const primary = colors.brandPrimary ?? DEFAULT_BRAND_PRIMARY;
	const accent = colors.brandAccent ?? DEFAULT_BRAND_ACCENT;
	const secondary = colors.brandSecondary ?? DEFAULT_BRAND_SECONDARY;

	root.style.setProperty("--brand-primary", primary);
	root.style.setProperty("--brand-accent", accent);
	root.style.setProperty("--brand-secondary", secondary);
}

/**
 * Removes brand color CSS custom properties, reverting to defaults.
 */
export function clearBrandTokens(): void {
	if (typeof document === "undefined") return;

	const root = document.documentElement;
	root.style.removeProperty("--brand-primary");
	root.style.removeProperty("--brand-accent");
	root.style.removeProperty("--brand-secondary");
}

/**
 * Extracts brand colors from a demo config object.
 */
export function extractBrandColors(demoConfig?: {
	brandColor?: string;
	brandColorAccent?: string;
	brandColorSecondary?: string;
}): BrandColors {
	if (!demoConfig) {
		return {};
	}

	return {
		brandPrimary: demoConfig.brandColor,
		brandAccent: demoConfig.brandColorAccent,
		brandSecondary: demoConfig.brandColorSecondary,
	};
}
