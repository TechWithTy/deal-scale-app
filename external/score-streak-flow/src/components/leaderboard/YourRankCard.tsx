import { Card, CardContent } from "@root/components/ui/card";
import { Badge } from "@root/components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface YourRankCardProps {
	rank: number | null;
	totalPlayers: number;
	isOnline?: boolean;
}

export const YourRankCard = ({ rank, totalPlayers }: YourRankCardProps) => {
	if (!rank) return null;

	const percentage = (((totalPlayers - rank) / totalPlayers) * 100).toFixed(1);
	const isTopTier = rank <= 100;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="sticky top-4 z-10"
		>
			<Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg">
				<CardContent className="p-3 sm:p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
								<Trophy className="h-5 w-5 text-primary" />
							</div>

							<div className="min-w-0">
								<h3 className="font-semibold text-sm text-foreground sm:text-base">
									Your Rank
								</h3>
								<p className="text-muted-foreground text-xs sm:text-sm">
									Top {percentage}% of players
								</p>
							</div>
						</div>

						<div className="flex shrink-0 flex-col items-end gap-1 sm:gap-2">
							<motion.div
								key={rank}
								initial={{ scale: 1 }}
								animate={{ scale: [1, 1.1, 1] }}
								transition={{ duration: 0.6 }}
								className="flex items-center gap-2"
							>
								<span className="font-bold text-lg text-foreground sm:text-xl md:text-2xl">
									#{rank.toLocaleString()}
								</span>
							</motion.div>

							<div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
								{isTopTier && (
									<Badge
										variant="secondary"
										className="border-emerald-500/30 bg-emerald-500/20 text-[10px] text-emerald-700 sm:text-xs dark:text-emerald-400"
									>
										<TrendingUp className="mr-1 h-3 w-3" />
										Elite
									</Badge>
								)}

								<span className="text-muted-foreground text-[10px] sm:text-xs">
									of {totalPlayers.toLocaleString()}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};
