import { motion } from "framer-motion";

interface Props {
	animationEnabled: boolean;
	settings: { animationDuration: number; footerDelay: number };
	totalPlayers: number;
	maxPlayers: number;
}

export const LeaderboardFooter = ({
	animationEnabled,
	settings,
	totalPlayers,
	maxPlayers,
}: Props) => {
	const hasPlayers = totalPlayers > 0;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{
				duration: animationEnabled ? settings.animationDuration : 0,
				delay: animationEnabled ? settings.footerDelay : 0,
			}}
			className="border-border border-t pt-4 text-center sm:pt-5"
		>
			<p className="text-muted-foreground text-xs sm:text-sm">
				{hasPlayers
					? `Showing top ${Math.min(maxPlayers, totalPlayers).toLocaleString()} of ${totalPlayers.toLocaleString()} active players`
					: "No active players to rank yet"}
			</p>
		</motion.div>
	);
};
