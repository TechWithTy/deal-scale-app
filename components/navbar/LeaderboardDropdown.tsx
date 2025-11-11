"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/_utils";
import { useModalStore } from "@/lib/stores/dashboard";
import { useGamificationStore } from "@/lib/stores/gamification";
import { Trophy } from "lucide-react";
import { useEffect } from "react";

const topRankStyles: Record<
	1 | 2 | 3,
	{
		badgeClass: string;
		buttonClass: string;
		iconClass: string;
	}
> = {
	1: {
		badgeClass:
			"bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 text-amber-950",
		buttonClass:
			"border-amber-300 shadow-[0_0_0.75rem] shadow-amber-300/40 hover:border-amber-400",
		iconClass:
			"text-amber-400 drop-shadow-[0_0.4rem_0.65rem_rgba(251,191,36,0.35)]",
	},
	2: {
		badgeClass:
			"bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 text-blue-950",
		buttonClass:
			"border-blue-300 shadow-[0_0_0.75rem] shadow-blue-300/35 hover:border-blue-400",
		iconClass:
			"text-blue-400 drop-shadow-[0_0.4rem_0.65rem_rgba(96,165,250,0.35)]",
	},
	3: {
		badgeClass:
			"bg-gradient-to-br from-red-200 via-red-300 to-red-400 text-red-950",
		buttonClass:
			"border-red-300 shadow-[0_0_0.75rem] shadow-red-300/35 hover:border-red-400",
		iconClass:
			"text-red-400 drop-shadow-[0_0.4rem_0.65rem_rgba(248,113,113,0.35)]",
	},
};

export default function LeaderboardDropdown() {
	const { openLeaderboardModal } = useModalStore();
	const hasRankChanged = useGamificationStore((state) => state.hasRankChanged);
	const clearRankChangeIndicator = useGamificationStore(
		(state) => state.clearRankChangeIndicator,
	);
	const currentRank = useGamificationStore((state) => state.currentRank);

	// Check for rank changes on mount
	useEffect(() => {
		// This will be populated when the leaderboard modal is opened
		// For now, just initialize the check
	}, []);

	const handleClick = () => {
		clearRankChangeIndicator();
		openLeaderboardModal();
	};

	const style =
		typeof currentRank === "number" && currentRank >= 1 && currentRank <= 3
			? topRankStyles[currentRank as 1 | 2 | 3]
			: undefined;

	const ariaLabel =
		typeof currentRank === "number"
			? `Open leaderboard. Current rank: #${currentRank}`
			: "Open leaderboard";

	return (
		<Button
			variant="outline"
			size="icon"
			aria-label={ariaLabel}
			title={
				typeof currentRank === "number"
					? `Your leaderboard rank: #${currentRank}`
					: "Open leaderboard"
			}
			className={cn(
				"relative transition-shadow duration-200",
				style?.buttonClass,
			)}
			onClick={handleClick}
		>
			<Trophy
				className={cn(
					"h-[1.1rem] w-[1.1rem] transition-colors duration-200",
					style?.iconClass,
				)}
			/>
			{style ? (
				<span
					aria-hidden="true"
					className={cn(
						"-bottom-1 -left-1 absolute flex h-4 w-4 items-center justify-center rounded-full text-[0.625rem] font-semibold leading-none ring-2 ring-background",
						style.badgeClass,
					)}
				>
					{currentRank}
				</span>
			) : null}
			{hasRankChanged ? (
				<span className="-right-0.5 -top-0.5 absolute inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-500" />
			) : null}
		</Button>
	);
}
