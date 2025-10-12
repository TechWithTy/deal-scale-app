function parseHexColor(color: string) {
	const hex = color.trim().replace(/^#/, "");
	if (hex.length !== 6) {
		throw new Error(`Unsupported color format: ${color}`);
	}
	const r = Number.parseInt(hex.slice(0, 2), 16);
	const g = Number.parseInt(hex.slice(2, 4), 16);
	const b = Number.parseInt(hex.slice(4, 6), 16);
	return { r, g, b };
}

function srgbToLinear(value: number) {
	const channel = value / 255;
	if (channel <= 0.03928) {
		return channel / 12.92;
	}
	return ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: string) {
	const { r, g, b } = parseHexColor(color);
	const [rLinear, gLinear, bLinear] = [r, g, b].map(srgbToLinear);
	return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

export function calculateContrastRatio(colorA: string, colorB: string): number {
	const lumA = relativeLuminance(colorA);
	const lumB = relativeLuminance(colorB);
	const lighter = Math.max(lumA, lumB);
	const darker = Math.min(lumA, lumB);
	const ratio = (lighter + 0.05) / (darker + 0.05);
	return Number(ratio.toFixed(2));
}
