import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import type { Player } from "../realtime/WebSocketProvider";
import { RankRow } from "./RankRow";

interface LeaderboardTableProps {
	players: Player[];
	currentUserId?: string;
	rowDuration?: number;
	rowDelayMultiplier?: number;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
	players,
	currentUserId = "player-15", // Mock current user ID
	rowDuration = 0.4,
	rowDelayMultiplier = 0.02,
}) => {
	// Progressive reveal: incrementally increase how many rows are shown
	const [visibleCount, setVisibleCount] = React.useState(0);

	// Clamp visibleCount when list shrinks
	React.useEffect(() => {
		setVisibleCount((c) => Math.min(c, players.length));
	}, [players.length]);

	// On players change, progressively reveal one-by-one
	React.useEffect(() => {
		if (players.length === 0) {
			setVisibleCount(0);
			return;
		}
		// Reveal speed derived from rowDuration for a smooth feel
		const stepMs = Math.max(120, Math.floor(rowDuration * 600));
		const interval = window.setInterval(() => {
			setVisibleCount((c) => {
				if (c >= players.length) {
					window.clearInterval(interval);
					return c;
				}
				return c + 1;
			});
		}, stepMs);
		return () => window.clearInterval(interval);
		// Re-run when list reference or animation duration changes
	}, [players, rowDuration]);

	const shown = React.useMemo(
		() => players.slice(0, visibleCount),
		[players, visibleCount],
	);

	if (players.length === 0) {
		return (
			<div className="rounded-lg border border-dashed bg-card/60 px-4 py-8 text-center">
				<p className="font-medium text-foreground text-sm">
					No active players yet
				</p>
				<p className="mt-1 text-muted-foreground text-xs">
					New rankings will appear here as soon as player activity is available.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-2 md:gap-3 xl:grid-cols-2">
			<AnimatePresence mode="popLayout">
				{shown.map((player, index) => (
					<motion.div
						key={player.id}
						layout
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 20 }}
						transition={{
							duration: rowDuration,
							delay: index * rowDelayMultiplier, // Stagger effect
							ease: "easeOut",
						}}
						className={player.rank === 1 ? "xl:col-span-2" : ""}
					>
						<RankRow
							player={player}
							isCurrentUser={player.id === currentUserId}
						/>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
};
