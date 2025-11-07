"use client";

import React from "react";
import { Star } from "lucide-react";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/index";

interface Avatar {
	imageUrl: string;
	profileUrl: string;
}
interface AvatarCirclesProps {
	className?: string;
	numPeople?: number;
	avatarUrls: Avatar[];
	interaction?: "tooltip" | "popover";
	reviews?: Array<{
		title: string;
		subtitle?: string;
		quote?: string;
		rating?: number;
	}>;
}

export const AvatarCircles = ({
	numPeople,
	className,
	avatarUrls,
	interaction = "tooltip",
	reviews,
}: AvatarCirclesProps) => {
	const renderRating = (rating?: number) => {
		if (!rating) {
			return null;
		}
		const rounded = Math.round(rating);
		return (
			<div className="flex items-center gap-0.5">
				{Array.from({ length: 5 }).map((_, index) => (
					<Star
						key={`avatar-rating-${index}`}
						className={cn(
							"h-3 w-3",
							index < rounded
								? "fill-yellow-400 text-yellow-400"
								: "text-muted-foreground/30",
						)}
					/>
				))}
			</div>
		);
	};

	const avatars = avatarUrls.map((url, index) => {
		const review = reviews?.[index];
		const avatarAnchor = (
			<a
				key={`avatar-${index}`}
				href={url.profileUrl}
				target="_blank"
				rel="noopener noreferrer"
			>
				<img
					className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
					src={url.imageUrl}
					width={40}
					height={40}
					alt={`Avatar ${index + 1}`}
				/>
			</a>
		);

		if (!review) {
			return avatarAnchor;
		}

		if (interaction === "popover") {
			return (
				<Popover key={`avatar-${index}`}>
					<PopoverTrigger asChild>{avatarAnchor}</PopoverTrigger>
					<PopoverContent className="w-64 space-y-2 p-4" align="center">
						<div className="space-y-1 text-center">
							<p className="text-sm font-semibold text-foreground">
								{review.title}
							</p>
							{review.subtitle ? (
								<p className="text-xs text-muted-foreground">
									{review.subtitle}
								</p>
							) : null}
						</div>
						{renderRating(review.rating)}
						{review.quote ? (
							<p className="text-xs italic text-muted-foreground">
								“{review.quote}”
							</p>
						) : null}
					</PopoverContent>
				</Popover>
			);
		}

		return (
			<Tooltip key={`avatar-${index}`} delayDuration={150}>
				<TooltipTrigger asChild>{avatarAnchor}</TooltipTrigger>
				<TooltipContent side="top" className="w-48 space-y-1 text-center">
					<p className="text-xs font-semibold text-foreground">
						{review.title}
					</p>
					{review.subtitle ? (
						<p className="text-[11px] text-muted-foreground">
							{review.subtitle}
						</p>
					) : null}
					{renderRating(review.rating)}
					{review.quote ? (
						<p className="text-[11px] italic text-muted-foreground">
							“{review.quote}”
						</p>
					) : null}
				</TooltipContent>
			</Tooltip>
		);
	});

	const body = (
		<div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
			{avatars}
			{(numPeople ?? 0) > 0 && (
				<a
					className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black"
					href=""
				>
					+{numPeople}
				</a>
			)}
		</div>
	);

	if (interaction === "popover") {
		return body;
	}

	return <TooltipProvider>{body}</TooltipProvider>;
};
