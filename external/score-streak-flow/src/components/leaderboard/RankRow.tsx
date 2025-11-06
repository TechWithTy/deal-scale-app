import { motion } from "framer-motion";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@root/components/ui/avatar";
import { Badge } from "@root/components/ui/badge";
import { RankHighlight } from "./RankHighlight";
import { PredictionBadge } from "../ai/PredictionBadge";
import type { Player } from "../realtime/WebSocketProvider";
import { cn } from "@root/lib/_utils";
import { Medal, Crown } from "lucide-react";
import {
	MessageSquare,
	Video,
	UserPlus,
	ArrowUp,
	ArrowDown,
	Minus,
} from "lucide-react";
import { Button } from "@root/components/ui/button";
import { PlayerTitle } from "./PlayerTitle";
import { OnlineStatus } from "./OnlineStatus";
import { ScoreBlock } from "./ScoreBlock";
import { CreditRequestPopover } from "./CreditRequestPopover";
import { DonationPopover } from "./DonationPopover";
import { buildTopRowExtras } from "./utils";
import { BorderBeam } from "@root/components/magicui/border-beam";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface RankRowProps {
	player: Player;
	isCurrentUser?: boolean;
}

export const RankRow = ({ player, isCurrentUser = false }: RankRowProps) => {
	const MotionDiv = motion.div;
	const [isExpanded, setIsExpanded] = useState(false);
	const hasRankChanged =
		player.previousRank && player.previousRank !== player.rank;
	const rankImproved = player.previousRank && player.rank < player.previousRank;
	const canRequestCredits = player.rank <= 10;
	const isTop10 = player.rank <= 10;
	const isTop3 = player.rank <= 3;
	const isChampion = player.rank === 1;

	const topRowExtras = buildTopRowExtras(player);

	return (
		<MotionDiv
			layout
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.3, ease: "easeInOut" }}
			className={cn(
				"relative flex flex-col gap-2 rounded-lg border px-4 py-2 transition-all duration-smooth sm:px-3 sm:py-3 md:flex-row md:items-center md:gap-4 md:p-4 lg:gap-5 lg:p-5",
				"group cursor-pointer hover:shadow-card lg:hover:shadow-lg lg:hover:scale-[1.01]",
				isCurrentUser && "border-primary bg-primary/5 ring-1 ring-primary/20",
				hasRankChanged && rankImproved && "animate-rank-up",
				hasRankChanged && !rankImproved && "animate-rank-down",
				!isCurrentUser && "border-border bg-card hover:bg-card-hover",
				// Champion (#1) red-accented spotlight, aligned with theme tokens
				isChampion &&
					"-translate-y-px z-[1] scale-[1.01] border-destructive/50 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent shadow-destructive/20 shadow-xl ring-2 ring-destructive/30 md:scale-[1.015]",
				topRowExtras,
			)}
		>
			{isChampion && (
				<>
					<BorderBeam
						size={250}
						duration={8}
						delay={0}
						colorFrom="#fbbf24"
						colorTo="#f59e0b"
					/>
					<div className="pointer-events-none absolute top-0 right-0 left-0 h-0.5 animate-pulse bg-gradient-to-r from-transparent via-destructive/70 to-transparent" />
				</>
			)}
			{isChampion && (
				<div className="-top-2 -right-2 absolute hidden rounded-md border-2 border-yellow-600 bg-gradient-to-r from-yellow-500 to-yellow-600 px-2 py-1 text-xs font-bold text-white shadow-lg md:block dark:border-yellow-500 dark:from-yellow-600 dark:to-yellow-700 dark:text-white">
					#1 Champion 🏆
				</div>
			)}
			{/* Mobile: Rank + Avatar + Info in a row, Score below */}
			{/* Desktop: Rank + Avatar + Info + Score in a row */}
			<div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-1 md:flex-row md:items-start md:gap-3 lg:flex-col lg:items-center">
				{/* Rank + Avatar row on mobile, inline on desktop */}
				<div className="flex items-center gap-2 md:contents lg:flex lg:flex-col lg:items-center lg:gap-3">
				{/* Rank Badge */}
				<RankHighlight
					rank={player.rank}
					isCurrentUser={isCurrentUser}
					className="h-10 w-14 shrink-0 sm:h-8 sm:w-12 lg:h-10 lg:w-16"
				/>

				{/* Player Avatar */}
				<Avatar
					className={cn(
						"relative h-12 w-12 shrink-0 border-2 transition-colors duration-smooth sm:h-12 sm:w-12 lg:h-14 lg:w-14",
						isChampion
							? "scale-110 border-destructive shadow-destructive/30 shadow-md"
							: isTop3
								? "border-primary shadow-md shadow-primary/20"
								: "border-border group-hover:border-primary/30",
					)}
				>
					<AvatarImage src={player.avatar} alt={`${player.username}'s avatar`} />
					<AvatarFallback className="bg-gradient-primary font-semibold text-primary-foreground">
						{player.username.substring(0, 2).toUpperCase()}
					</AvatarFallback>
					{isChampion && (
						<>
							<div
								className="-inset-1 absolute rounded-full bg-destructive/15 blur-md"
								aria-hidden="true"
							/>
							<Crown
								className="-top-2 -left-2 absolute h-4 w-4 text-destructive drop-shadow"
								aria-hidden="true"
							/>
						</>
					)}
				</Avatar>
				</div>

				{/* Player Info */}
				<div className="w-full min-w-0 space-y-1 text-center md:w-auto md:flex-1 md:space-y-0 md:text-left lg:w-full lg:space-y-1 lg:text-center">
				{/* Line 1: Name + Champion/Silver/Bronze badge */}
				<div className="flex flex-wrap items-center justify-center gap-2 md:mb-1 md:justify-start md:gap-3 lg:justify-center">
					<PlayerTitle
						player={player}
						isCurrentUser={isCurrentUser}
						isTop10={isTop10}
					/>
					{isTop3 &&
						(isChampion ? (
							<Badge
								className="flex items-center gap-1 border-2 border-yellow-600 bg-gradient-to-r from-yellow-500 to-yellow-600 px-2 py-1 text-xs font-bold text-white shadow-lg sm:gap-1.5 sm:px-3 sm:text-sm lg:text-base dark:border-yellow-500 dark:from-yellow-600 dark:to-yellow-700 dark:text-white"
							>
								<Medal className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
								Champion
							</Badge>
						) : (
							<Badge className={cn(
								"flex items-center gap-1 border-2 px-2 py-1 text-xs font-semibold text-white shadow-md sm:gap-1.5 sm:text-sm lg:text-base dark:text-white",
								player.rank === 2 && "border-gray-400 bg-gradient-to-r from-gray-400 to-gray-500 dark:border-gray-500 dark:from-gray-600 dark:to-gray-700",
								player.rank === 3 && "border-orange-600 bg-gradient-to-r from-orange-600 to-orange-700 dark:border-orange-500 dark:from-orange-600 dark:to-orange-700"
							)}>
								<Medal className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
								{player.rank === 2 ? "Silver" : "Bronze"}
							</Badge>
						))}
					{!isTop3 && isTop10 && (
						<Badge className="border-2 border-purple-600 bg-gradient-to-r from-purple-600 to-purple-700 px-2 py-1 text-xs font-semibold text-white shadow-md sm:text-sm lg:text-base dark:border-purple-500 dark:from-purple-600 dark:to-purple-700 dark:text-white">
							Top 10
						</Badge>
					)}
				</div>

				{/* Line 2: Status + Location & Company */}
				<div className="flex flex-wrap items-center justify-center gap-2 md:justify-start md:gap-3 lg:justify-center">
					{/* Online Status */}
					<OnlineStatus isOnline={player.isOnline} />

					{/* Location & Company */}
					{(player.city || player.state || player.company) && (
						<span className="truncate text-muted-foreground text-xs">
							{player.city ? `${player.city}` : ""}
							{player.city && player.state ? ", " : ""}
							{player.state ?? ""}
							{(player.city || player.state) && player.company ? " • " : ""}
							{player.company ?? ""}
						</span>
					)}
				</div>
				{/* Champion Message - mobile only, inline on md, below name on lg */}
				{isChampion && (
					<div className="mt-1 text-destructive text-xs font-medium md:mt-0 md:hidden lg:mt-1 lg:block">
						You're #1 — others are closing in!
					</div>
				)}

				{/* Row 1: Prediction + Reputation */}
				<div className="mt-1 flex flex-wrap items-center justify-center gap-2 md:mt-0 md:justify-start md:gap-3 lg:mt-2 lg:justify-center">
					{isChampion && (
						<span className="hidden text-destructive text-xs font-medium md:inline lg:hidden">
							You're #1 — others are closing in!
						</span>
					)}
					<PredictionBadge
						currentRank={player.rank}
						predictedRank={player.prediction}
					/>
					{/* Reputation: total tally with recent delta indicator */}
					<div className="flex items-center gap-1" title="Reputation">
						<Badge
							variant="secondary"
							className={cn(
								"flex items-center gap-1 px-2 py-0.5 text-xs",
								player.reputation > 0 && "text-green-600",
								player.reputation < 0 && "text-red-600",
								player.reputation === 0 && "text-muted-foreground",
							)}
						>
							{player.reputation > 0 ? (
								<ArrowUp className="h-3 w-3" />
							) : player.reputation < 0 ? (
								<ArrowDown className="h-3 w-3" />
							) : (
								<Minus className="h-3 w-3" />
							)}
							<span>{player.reputation}</span>
						</Badge>
						{typeof player.reputationDelta !== "undefined" && (
							<span
								className={cn(
									"inline-flex items-center justify-center rounded-sm border px-1.5 py-0.5 text-[10px] leading-none",
									player.reputationDelta === 1 &&
										"border-green-200 bg-green-50 text-green-600 dark:bg-green-950/30",
									player.reputationDelta === -1 &&
										"border-red-200 bg-red-50 text-red-600 dark:bg-red-950/30",
									player.reputationDelta === 0 &&
										"border-muted bg-muted/30 text-muted-foreground",
								)}
								title={
									player.reputationDelta === 1
										? "Most recent rating: positive"
										: player.reputationDelta === -1
											? "Most recent rating: negative"
											: "Most recent rating: neutral"
								}
								aria-label="Recent reputation change"
							>
								{player.reputationDelta === 1 ? (
									<ArrowUp className="h-3 w-3" />
								) : player.reputationDelta === -1 ? (
									<ArrowDown className="h-3 w-3" />
								) : (
									<Minus className="h-3 w-3" />
								)}
							</span>
						)}
					</div>
				</div>

				{/* Row 2: Outbound icons + Request/Donation chips (all inline) */}
				<div
					className="mt-1.5 flex w-full flex-wrap items-center justify-center gap-2 md:mt-1 md:w-auto md:justify-start md:gap-3 lg:mt-1.5 lg:w-full lg:justify-center"
					aria-label="Actions"
				>
					{/* Chat */}
					<Button
						type="button"
						asChild
						variant="ghost"
						size="icon"
						className="h-9 w-9 sm:h-8 sm:w-8"
						title="Open chat in new tab"
					>
						<a
							href={`/chat/${player.id}`}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`Open chat with ${player.username}`}
						>
							<MessageSquare className="h-4 w-4" />
						</a>
					</Button>
					{/* Video Call */}
					<Button
						type="button"
						asChild
						variant="ghost"
						size="icon"
						className="h-9 w-9 sm:h-8 sm:w-8"
						title="Start video call in new tab"
					>
						<a
							href={`/video/${player.id}`}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`Start video with ${player.username}`}
						>
							<Video className="h-4 w-4" />
						</a>
					</Button>
					{/* Add Friend / People action */}
					<Button
						type="button"
						asChild
						variant="ghost"
						size="icon"
						className="h-9 w-9 sm:h-8 sm:w-8"
						title="Add friend"
					>
						<a
							href={`https://www.facebook.com/search/top?q=${encodeURIComponent(player.username)}`}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`Add friend: ${player.username}`}
						>
							<UserPlus className="h-4 w-4" />
						</a>
					</Button>
					
					{/* Credit actions inline with other buttons */}
					{canRequestCredits && <CreditRequestPopover player={player} />}
					{!isTop10 && <DonationPopover player={player} />}
				</div>
				</div>
			</div>

			{/* Score - Mobile: below player info with reduced spacing, Desktop: right side, Large: below and centered */}
			<div className={cn("mt-1 md:mt-0 md:shrink-0 lg:mt-3 lg:w-full", isChampion && "md:scale-[1.05] md:drop-shadow-sm")}>
				<ScoreBlock
					score={player.score}
					hasRankChanged={!!hasRankChanged}
					rankImproved={!!rankImproved}
					isCurrentUser={isCurrentUser}
					rankDelta={
						player.previousRank != null
							? player.rank - player.previousRank
							: undefined
					}
					city={player.city}
					dealsCount={player.dealsCount}
				/>
			</div>

			{/* Champion Video Showcase - Only for #1 */}
			{isChampion && (
				<div className="w-full mt-3 md:mt-4">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex w-full items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
					>
						{isExpanded ? (
							<>
								<ChevronUp className="h-4 w-4" />
								Hide Champion Showcase
							</>
						) : (
							<>
								<ChevronDown className="h-4 w-4" />
								View Champion Showcase
							</>
						)}
					</Button>
					
					{isExpanded && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3 }}
							className="mt-3 overflow-hidden"
						>
							<div className="rounded-lg border border-border bg-card/50 p-3">
								<div className="mb-2 flex items-center justify-between">
									<h4 className="font-semibold text-sm text-foreground">
										🏆 Champion's Success Story
									</h4>
									<span className="text-xs text-muted-foreground">90s highlight</span>
								</div>
								<div className="relative aspect-[9/16] w-full max-w-[300px] mx-auto overflow-hidden rounded-md bg-black">
									<iframe
										src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&modestbranding=1&rel=0"
										title="Champion Showcase"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
										className="absolute inset-0 h-full w-full"
									/>
								</div>
								<p className="mt-2 text-center text-xs text-muted-foreground italic">
									"See how {player.username} reached #1"
								</p>
							</div>
						</motion.div>
					)}
				</div>
			)}
		</MotionDiv>
	);
};
