import type React from "react";
import { Badge } from "@root/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PredictionBadgeProps {
	currentRank: number;
	predictedRank?: number;
}

export const PredictionBadge: React.FC<PredictionBadgeProps> = ({
	currentRank,
	predictedRank,
}) => {
	if (!predictedRank) return null;

	const difference = currentRank - predictedRank;
	const isRising = difference > 0;
	const isStable = difference === 0;

	const getVariant = () => {
		if (isStable) return "secondary";
		return isRising ? "default" : "destructive";
	};

	const getIcon = () => {
		if (isStable) return <Minus className="h-3 w-3" />;
		return isRising ? (
			<TrendingUp className="h-3 w-3" />
		) : (
			<TrendingDown className="h-3 w-3" />
		);
	};

	const getText = () => {
		if (isStable) return `Stable ~${predictedRank}`;
		const direction = isRising ? "up" : "down";
		return `${direction} ~${predictedRank}`;
	};

	return (
		<Badge
			variant={getVariant()}
			className="flex animate-fade-in items-center gap-1 font-medium text-green-500 text-xs"
		>
			{getIcon()}
			{getText()}
		</Badge>
	);
};
