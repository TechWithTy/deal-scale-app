import type React from "react";
import { motion } from "framer-motion";
import { Badge } from "@root/components/ui/badge";
import { cn } from "@root/lib/_utils";
import { formatScore } from "./utils";

interface ScoreBlockProps {
	score: number;
	hasRankChanged: boolean | undefined;
	rankImproved: boolean | undefined;
	isCurrentUser?: boolean;
	rankDelta?: number;
}

export const ScoreBlock: React.FC<ScoreBlockProps> = ({
	score,
	hasRankChanged,
	rankImproved,
	isCurrentUser = false,
	rankDelta,
}) => {
	return (
		<div className="flex shrink-0 flex-col items-end gap-1">
			<motion.div
				key={score}
				initial={{ scale: 1 }}
				animate={{ scale: hasRankChanged ? [1, 1.1, 1] : 1 }}
				transition={{ duration: 0.6 }}
				className={cn(
					"font-bold text-lg transition-colors duration-smooth",
					isCurrentUser ? "text-primary" : "text-foreground",
				)}
			>
				{formatScore(score)}
			</motion.div>

			{hasRankChanged && typeof rankDelta === "number" && (
				<Badge
					variant={rankImproved ? "default" : "destructive"}
					className="text-xs"
				>
					{rankImproved ? "↗" : "↘"} {Math.abs(rankDelta)}
				</Badge>
			)}
		</div>
	);
};
