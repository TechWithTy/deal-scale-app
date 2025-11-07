"use client";

import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/stores/dashboard";
import { useGamificationStore } from "@/lib/stores/gamification";
import { Trophy } from "lucide-react";
import { useEffect } from "react";

export default function LeaderboardDropdown() {
	const { openLeaderboardModal } = useModalStore();
	const { hasRankChanged, clearRankChangeIndicator } = useGamificationStore();

	// Check for rank changes on mount
	useEffect(() => {
		// This will be populated when the leaderboard modal is opened
		// For now, just initialize the check
	}, []);

	const handleClick = () => {
		clearRankChangeIndicator();
		openLeaderboardModal();
	};

	return (
		<Button
			variant="outline"
			size="icon"
			aria-label="Open leaderboard"
			className="relative"
			onClick={handleClick}
		>
			<Trophy className="h-[1.1rem] w-[1.1rem]" />
			{hasRankChanged ? (
				<span className="-right-0.5 -top-0.5 absolute inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-500" />
			) : null}
		</Button>
	);
}
