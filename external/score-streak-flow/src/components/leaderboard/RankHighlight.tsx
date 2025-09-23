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
			return "bg-primary/10 border-primary shadow-glow";
		}

		switch (rank) {
			case 1:
				return "bg-gradient-gold border-rank-1 shadow-rank";
			case 2:
				return "bg-gradient-silver border-rank-2 shadow-lg";
			case 3:
				return "bg-gradient-bronze border-rank-3 shadow-lg";
			default:
				if (rank <= 10) {
					return "bg-rank-top10/5 border-rank-top10/20 hover:bg-rank-top10/10";
				}
				return "hover:bg-card-hover";
		}
	};

	const getRankTextColor = () => {
		if (isCurrentUser) return "text-primary font-bold";

		switch (rank) {
			case 1:
				return "text-rank-1 font-bold text-lg";
			case 2:
				return "text-rank-2 font-bold text-lg";
			case 3:
				return "text-rank-3 font-bold text-lg";
			default:
				if (rank <= 10) {
					return "text-rank-top10 font-semibold";
				}
				return "text-foreground font-medium";
		}
	};

	return (
		<div
			className={cn(
				"flex h-8 w-12 items-center justify-center rounded-md border transition-all duration-smooth",
				getRankStyling(),
				className,
			)}
		>
			<span className={cn("text-sm", getRankTextColor())}>#{rank}</span>
		</div>
	);
};
