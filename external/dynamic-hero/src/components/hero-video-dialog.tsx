"use client";

import Image from "next/image";
import { Play, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useMemo, useState } from "react";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import type { HeroVideoConfig } from "../types/video";
import {
	resolveHeroThumbnailSrc,
	resolveHeroVideoSrc,
	shouldBypassImageOptimization,
} from "../utils/video";

export interface HeroVideoDialogProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
	video: HeroVideoConfig;
	animationStyle?:
		| "from-bottom"
		| "from-center"
		| "from-top"
		| "from-left"
		| "from-right"
		| "fade"
		| "top-in-bottom-out"
		| "left-in-right-out";
	thumbnailAlt?: string;
	onOpenChange?: (isOpen: boolean) => void;
}

const animationPresets = {
	"from-bottom": {
		initial: { y: "100%", opacity: 0 },
		animate: { y: 0, opacity: 1 },
		exit: { y: "100%", opacity: 0 },
	},
	"from-center": {
		initial: { scale: 0.5, opacity: 0 },
		animate: { scale: 1, opacity: 1 },
		exit: { scale: 0.5, opacity: 0 },
	},
	"from-top": {
		initial: { y: "-100%", opacity: 0 },
		animate: { y: 0, opacity: 1 },
		exit: { y: "-100%", opacity: 0 },
	},
	"from-left": {
		initial: { x: "-100%", opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: "-100%", opacity: 0 },
	},
	"from-right": {
		initial: { x: "100%", opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: "100%", opacity: 0 },
	},
	fade: {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
	},
	"top-in-bottom-out": {
		initial: { y: "-100%", opacity: 0 },
		animate: { y: 0, opacity: 1 },
		exit: { y: "100%", opacity: 0 },
	},
	"left-in-right-out": {
		initial: { x: "-100%", opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: "100%", opacity: 0 },
	},
} as const;

export function HeroVideoDialog({
	video,
	animationStyle = "from-center",
	thumbnailAlt = "Video thumbnail",
	className,
	onOpenChange,
	...containerProps
}: HeroVideoDialogProps): JSX.Element {
	const [isOpen, setIsOpen] = useState(false);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
	const preset = useMemo(
		() => animationPresets[animationStyle] ?? animationPresets["from-center"],
		[animationStyle],
	);

	const trackElement = (
		captions: NonNullable<HeroVideoConfig["captions"]>,
	): JSX.Element => (
		<track
			src={captions.src}
			kind={captions.kind}
			label={captions.label}
			srcLang={captions.srclang}
			default={captions.default}
		/>
	);

	const videoSrc = resolveHeroVideoSrc(video);
	const thumbnailSrc = resolveHeroThumbnailSrc(video);
	const unoptimizedThumbnail = shouldBypassImageOptimization(thumbnailSrc);
	useEffect(() => {
		onOpenChange?.(isOpen);
	}, [isOpen, onOpenChange]);

	const openModal = () => {
		setIsOpen(true);
	};

	const closeModal = () => {
		setIsOpen(false);
	};

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setPrefersReducedMotion(mediaQuery.matches);
		update();
		mediaQuery.addEventListener("change", update);
		return () => mediaQuery.removeEventListener("change", update);
	}, []);

	const shouldAutoPlayThumbnail =
		!!video.thumbnailVideo && !prefersReducedMotion;

	return (
		<div
			className={cn("relative h-full w-full", className)}
			{...containerProps}
		>
			{!isOpen ? (
				<button
					type="button"
					aria-label="Play video"
					className="group absolute inset-0 z-20 cursor-pointer overflow-hidden rounded-[28px] border-0 bg-transparent p-0 transition duration-200 ease-out"
					onClick={openModal}
				>
					{video.thumbnailVideo && shouldAutoPlayThumbnail ? (
						<video
							className="absolute inset-0 size-full object-cover transition-all duration-200 ease-out group-hover:brightness-[0.92]"
							src={video.thumbnailVideo}
							poster={thumbnailSrc}
							autoPlay
							muted
							loop
							playsInline
							preload="metadata"
						/>
					) : (
						<Image
							src={thumbnailSrc}
							alt={video.posterAlt ?? thumbnailAlt}
							fill
							unoptimized={unoptimizedThumbnail}
							priority
							className="object-cover transition-all duration-200 ease-out group-hover:brightness-[0.92]"
						/>
					)}
					<span
						aria-hidden
						className="pointer-events-none absolute inset-x-0 bottom-[-2px] h-[22%] rounded-t-[32px] bg-gradient-to-t from-background/90 via-background/60 to-transparent opacity-95 transition duration-200 ease-out"
					/>
					<div className="absolute inset-0 flex scale-[0.9] items-center justify-center rounded-2xl transition-all duration-200 ease-out group-hover:scale-100">
						<div className="flex size-28 items-center justify-center rounded-full bg-primary/10 backdrop-blur-md">
							<div className="relative flex size-20 scale-100 items-center justify-center rounded-full bg-gradient-to-b from-primary/30 to-primary shadow-md transition-all duration-200 ease-out group-hover:scale-[1.2]">
								<Play
									className="size-8 scale-100 fill-white text-white transition-transform duration-200 ease-out group-hover:scale-105"
									style={{
										filter:
											"drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
									}}
								/>
							</div>
						</div>
					</div>
				</button>
			) : null}
			<AnimatePresence>
				{isOpen ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
						onClick={closeModal}
						onKeyDown={(event) => {
							if (
								event.key === "Escape" ||
								event.key === "Enter" ||
								event.key === " "
							) {
								event.preventDefault();
								closeModal();
							}
						}}
						tabIndex={0}
					>
						<motion.div
							{...preset}
							transition={{ type: "spring", damping: 30, stiffness: 300 }}
							className="relative mx-4 aspect-video w-full max-w-4xl md:mx-0"
							onClick={(event) => event.stopPropagation()}
						>
							<motion.button
								type="button"
								onClick={closeModal}
								aria-label="Close video"
								className="-top-16 absolute right-0 rounded-full bg-neutral-900/50 p-2 text-white text-xl ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black"
							>
								<XIcon className="size-5" />
							</motion.button>
							<div className="relative isolate z-[1] size-full overflow-hidden rounded-2xl border-2 border-white">
								{video.provider === "html5" ? (
									<video
										className="size-full rounded-2xl"
										controls
										playsInline
										autoPlay
										preload="metadata"
										poster={thumbnailSrc}
										data-testid="hero-video-html5"
									>
										<source src={videoSrc} type="video/mp4" />
										{video.captions ? trackElement(video.captions) : null}
										Sorry, your browser doesn't support embedded videos.
									</video>
								) : (
									<iframe
										src={videoSrc}
										title="Hero Video player"
										className="size-full rounded-2xl"
										loading="lazy"
										referrerPolicy="strict-origin-when-cross-origin"
										allowFullScreen
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									/>
								)}
							</div>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
