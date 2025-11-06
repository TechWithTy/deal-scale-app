import { cn } from "@ssf/lib/utils";
import type React from "react";

interface RankHighlightProps {
	rank: number;
	isCurrentUser?: boolean;
	className?: string;
}

export const RankHighlight: React.FC<RankHighlightProps> = ({
	rank,
	isCurrentUser = false,
	className,
}) => {
	const getRankStyling = () => {
		if (isCurrentUser) {
			return "bg-primary border-primary shadow-glow border-2";
		}

		switch (rank) {
			case 1:
				return "bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-600 shadow-lg shadow-yellow-500/50 border-2 dark:from-yellow-600 dark:to-yellow-700 dark:border-yellow-500";
			case 2:
				return "bg-gradient-to-br from-gray-400 to-gray-500 border-gray-500 shadow-lg border-2 dark:from-gray-600 dark:to-gray-700 dark:border-gray-500";
			case 3:
				return "bg-gradient-to-br from-orange-600 to-orange-700 border-orange-700 shadow-lg border-2 dark:from-orange-600 dark:to-orange-700 dark:border-orange-500";
			default:
				if (rank <= 10) {
					return "bg-gradient-to-br from-purple-600 to-purple-700 border-purple-600 shadow-md border-2 dark:from-purple-600 dark:to-purple-700 dark:border-purple-500";
				}
				return "bg-gradient-to-br from-slate-600 to-slate-700 border-slate-600 border-2 dark:from-slate-600 dark:to-slate-700 dark:border-slate-500";
		}
	};

	const getRankTextColor = () => {
		// All ranks now use white text for better contrast
		if (rank <= 10 || isCurrentUser) {
			return "text-white font-bold text-sm sm:text-base";
		}
		return "text-white font-semibold text-sm";
	};

	return (
		<div
			className={cn(
				"flex h-8 w-12 items-center justify-center rounded-md transition-all duration-smooth",
				getRankStyling(),
				className,
			)}
		>
			<span className={cn(getRankTextColor())}>#{rank}</span>
		</div>
	);
};
