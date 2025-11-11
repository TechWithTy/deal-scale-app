import type { HeroVideoConfig } from "../types/video";

const TRANSPARENT_PIXEL =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export const resolveHeroVideoSrc = (config: HeroVideoConfig): string =>
	config.src;

export const resolveHeroThumbnailSrc = (
	config: HeroVideoConfig,
	defaultPoster?: string,
): string => config.poster ?? defaultPoster ?? TRANSPARENT_PIXEL;
