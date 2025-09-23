import React from "react";
import { Alert, AlertDescription } from "@root/components/ui/alert";
import { Flame, TrendingUp } from "lucide-react";
import type { Player } from "../realtime/WebSocketProvider";

interface PlayerToWatchAlertProps {
	players: Player[];
}

export const PlayerToWatchAlert: React.FC<PlayerToWatchAlertProps> = ({
	players,
}) => {
	// Simple momentum detection - player who gained the most ranks
	const playerToWatch = React.useMemo(() => {
		if (players.length === 0) return null;

		const playersWithMomentum = players
			.filter((p) => p.previousRank !== undefined && p.rank < p.previousRank)
			.sort((a, b) => {
				const rankChangeA = (a.previousRank ?? 0) - a.rank;
				const rankChangeB = (b.previousRank ?? 0) - b.rank;
				return rankChangeB - rankChangeA;
			});

		return playersWithMomentum[0] || null;
	}, [players]);

	if (!playerToWatch?.previousRank) return null;

	const rankGain = playerToWatch.previousRank - playerToWatch.rank;

	return (
		<Alert className="animate-slide-in-up border-rank-rising bg-gradient-to-r from-green-400/20 via-green-500/10 to-transparent">
			<Flame className="h-4 w-4 text-rank-rising" />
			<AlertDescription className="flex items-center gap-2">
				<span className="font-bold text-lg text-rank-rising">
					🔥 Player to Watch:
				</span>
				<span className="font-medium">{playerToWatch.username}</span>
				<div className="flex items-center gap-2 text-green-400 text-muted-foreground text-sm">
					<TrendingUp className="h-4 w-4 text-rank-rising" />
					<span>+{rankGain} ranks</span>
				</div>
			</AlertDescription>
		</Alert>
	);
};
