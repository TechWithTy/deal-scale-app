"use client";

import {
	DEFAULT_HERO_VIDEO,
	resolveHeroThumbnailSrc,
} from "@external/dynamic-hero";
import { HeroVideoPreview } from "@external/dynamic-hero/components/hero-video-preview";

import type { QuickStartHeadlineVideo } from "@/lib/config/quickstart/headlines";

interface QuickStartVideoPreviewProps {
	readonly videoConfig?: QuickStartHeadlineVideo | undefined;
	readonly className?: string;
}

export const QUICKSTART_DEFAULT_VIDEO: QuickStartHeadlineVideo =
	DEFAULT_HERO_VIDEO;

export function QuickStartVideoPreview({
	videoConfig,
	className,
}: QuickStartVideoPreviewProps) {
	const config = videoConfig ?? QUICKSTART_DEFAULT_VIDEO;

	return (
		<HeroVideoPreview
			className={className}
			video={{
				...config,
				poster: resolveHeroThumbnailSrc(
					config,
					QUICKSTART_DEFAULT_VIDEO.poster,
				),
			}}
			thumbnailAlt="Watch how DealScale automates outreach"
		/>
	);
}
