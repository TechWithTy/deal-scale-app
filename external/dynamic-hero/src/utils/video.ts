import type { HeroVideoConfig } from "../types/video";

const TRANSPARENT_PIXEL =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const VALID_THUMBNAIL_EXTENSIONS = [
	".jpg",
	".jpeg",
	".png",
	".gif",
	".svg",
	".webp",
];

const hasOptimizedThumbnailExtension = (src: string): boolean =>
	VALID_THUMBNAIL_EXTENSIONS.some((extension) => src.endsWith(extension));

export const resolveHeroVideoSrc = (config: HeroVideoConfig): string =>
	config.src;

const derivePosterFromVideoSrc = (src: string): string | undefined => {
	const match = src.match(/\.(mp4|webm|mov)$/i);
	if (!match) {
		return undefined;
	}

	const base = src.slice(0, -match[0].length);
	const candidates = [".webp", ".gif", ".svg", ".png"];

	for (const extension of candidates) {
		const candidate = `${base}${extension}`;
		if (extension === ".webp" || hasOptimizedThumbnailExtension(candidate)) {
			return candidate;
		}
	}

	return undefined;
};

export const resolveHeroThumbnailSrc = (
	config: HeroVideoConfig,
	defaultPoster?: string,
): string => {
	if (config.poster) {
		return config.poster;
	}

	const derivedPoster = derivePosterFromVideoSrc(config.src);
	if (derivedPoster) {
		return derivedPoster;
	}

	if (defaultPoster) {
		return defaultPoster;
	}

	return TRANSPARENT_PIXEL;
};

export const isVectorOrAnimatedThumbnail = (src: string): boolean =>
	src.endsWith(".svg") || src.endsWith(".gif");

export const shouldBypassImageOptimization = (src: string): boolean =>
	isVectorOrAnimatedThumbnail(src) || !hasOptimizedThumbnailExtension(src);
