"use client";

import React from "react";

import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import type { QuickStartHeadlineVideo } from "@/lib/config/quickstart/headlines";
import { cn } from "@/lib/utils/index";

interface QuickStartVideoPreviewProps {
	readonly videoConfig?: QuickStartHeadlineVideo | undefined;
	readonly className?: string;
}

export const QUICKSTART_DEFAULT_VIDEO: QuickStartHeadlineVideo = {
	src: "https://www.youtube.com/embed/qh3NGpYRG3I?rel=0&controls=1&modestbranding=1",
	poster: "/images/quickstart/video-preview.svg",
	provider: "youtube",
};

const resolveVideoSrc = (config: QuickStartHeadlineVideo): string => {
	if (config.provider === "supademo") {
		return config.src;
	}

	return config.src;
};

export function QuickStartVideoPreview({
	videoConfig,
	className,
}: QuickStartVideoPreviewProps) {
	const config = videoConfig ?? QUICKSTART_DEFAULT_VIDEO;

	return (
		<div
			className={cn(
				"relative mx-auto w-full max-w-5xl overflow-hidden rounded-[32px] border border-border/40 bg-background/80 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)] backdrop-blur-lg",
				"ring-1 ring-border/30",
				className,
			)}
		>
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/10 opacity-70" />

			<HeroVideoDialog
				className="relative z-10"
				videoSrc={resolveVideoSrc(config)}
				thumbnailSrc={config.poster ?? QUICKSTART_DEFAULT_VIDEO.poster!}
				thumbnailAlt="Watch how DealScale automates outreach"
				animationStyle="from-center"
			/>

			<ProgressiveBlur
				position="top"
				height="28%"
				className="hidden md:block"
				blurLevels={[1, 2, 4, 8, 16, 24, 32, 48]}
			/>
			<ProgressiveBlur
				position="bottom"
				height="38%"
				className="hidden md:block"
				blurLevels={[1, 2, 4, 8, 16, 20, 28, 40]}
			/>
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-background/85 to-background" />
		</div>
	);
}
