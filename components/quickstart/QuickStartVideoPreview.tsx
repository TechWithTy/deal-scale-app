"use client";

import type { HTMLAttributes } from "react";

import {
	DEFAULT_HERO_VIDEO,
	resolveHeroThumbnailSrc,
} from "@external/dynamic-hero";
import { HeroVideoPreview } from "@external/dynamic-hero/components/hero-video-preview";

import type { QuickStartHeadlineVideo } from "@/lib/config/quickstart/headlines";

interface QuickStartVideoPreviewProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
	readonly videoConfig?: QuickStartHeadlineVideo | undefined;
}

export const QUICKSTART_DEFAULT_VIDEO: QuickStartHeadlineVideo =
	DEFAULT_HERO_VIDEO;

export function QuickStartVideoPreview({
	videoConfig,
	className,
	...containerProps
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
			{...containerProps}
		/>
	);
}
