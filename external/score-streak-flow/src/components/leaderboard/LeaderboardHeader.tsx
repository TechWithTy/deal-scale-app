import { motion } from "framer-motion";
import { Badge } from "@root/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@root/components/ui/button";
import { formatTime } from "../utils/time";

interface HeaderProps {
	animationEnabled: boolean;
	settings: { animationDuration: number; headerDelay: number };
	isConnected: boolean;
	isPaused: boolean;
	lastUpdated: Date;
	reconnect: () => void;
}

export const LeaderboardHeader = ({
	animationEnabled,
	settings,
	isConnected,
	isPaused,
	lastUpdated,
	reconnect,
}: HeaderProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: animationEnabled ? settings.animationDuration : 0,
				delay: animationEnabled ? settings.headerDelay : 0,
			}}
			className="space-y-4 text-center"
		>
			<div className="text-center">
				<h1 className="bg-gradient-primary bg-clip-text font-bold text-2xl text-transparent sm:text-3xl md:text-4xl lg:text-6xl">
					Live Leaderboard
				</h1>
				<p className="mt-2 text-sm text-muted-foreground sm:text-base md:text-lg">
					Real-time competitive rankings with AI predictions
				</p>
			</div>

			{/* Connection Status */}
			<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
				<Badge
					variant={isConnected ? "default" : "destructive"}
					className="flex items-center gap-2"
				>
					{isConnected ? (
						<Wifi className="h-4 w-4" />
					) : (
						<WifiOff className="h-4 w-4" />
					)}
					{isConnected ? "Connected" : "Disconnected"}
				</Badge>

				{isPaused && (
					<Badge variant="secondary" className="flex items-center gap-2">
						Paused
					</Badge>
				)}

				<span
					suppressHydrationWarning
					className="text-muted-foreground text-xs sm:text-sm"
				>
					Last updated: {formatTime(lastUpdated)}
				</span>

				{!isConnected && (
					<Button
						onClick={reconnect}
						size="sm"
						variant="outline"
						className="gap-2"
					>
						<RefreshCw className="h-4 w-4" />
						Reconnect
					</Button>
				)}
			</div>
		</motion.div>
	);
};
