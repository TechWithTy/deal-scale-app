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
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{
				duration: animationEnabled ? settings.animationDuration : 0,
				delay: animationEnabled ? settings.footerDelay : 0,
			}}
			className="border-border border-t pt-8 text-center"
		>
			<p className="text-muted-foreground">
				Showing top {Math.min(maxPlayers, totalPlayers)} of{" "}
				{totalPlayers.toLocaleString()} active players
			</p>
		</motion.div>
	);
};
