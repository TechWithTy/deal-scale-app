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

interface RankRowProps {
	player: Player;
	isCurrentUser?: boolean;
}

export const RankRow = ({ player, isCurrentUser = false }: RankRowProps) => {
	const MotionDiv = motion.div;
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
				"relative flex items-center gap-4 rounded-lg border p-4 transition-all duration-smooth",
				"group cursor-pointer hover:shadow-card",
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
				<div className="pointer-events-none absolute top-0 right-0 left-0 h-0.5 animate-pulse bg-gradient-to-r from-transparent via-destructive/70 to-transparent" />
			)}
			{isChampion && (
				<div className="-top-2 -right-2 absolute rounded bg-destructive px-2 py-0.5 text-[10px] text-destructive-foreground shadow-md">
					#1 Champion 🏆
				</div>
			)}
			{/* Rank Badge */}
			<RankHighlight
				rank={player.rank}
				isCurrentUser={isCurrentUser}
				className="shrink-0"
			/>

			{/* Player Avatar */}
			<Avatar
				className={cn(
					"relative shrink-0 border-2 transition-colors duration-smooth",
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

			{/* Player Info */}
			<div className="min-w-0 flex-1">
				<div className="mb-1 flex items-center gap-2">
					<PlayerTitle
						player={player}
						isCurrentUser={isCurrentUser}
						isTop10={isTop10}
					/>
					{isTop3 &&
						(isChampion ? (
							<Badge
								variant="destructive"
								className="flex items-center gap-1 px-2.5 py-0.5 text-[11px]"
							>
								<Medal className="h-3.5 w-3.5" />
								Champion
							</Badge>
						) : (
							<Badge variant="secondary" className="flex items-center gap-1">
								<Medal
									className={cn(
										"h-3.5 w-3.5",
										player.rank === 2 && "text-gray-400",
										player.rank === 3 && "text-amber-700",
									)}
								/>
								{player.rank === 2 ? "Silver" : "Bronze"}
							</Badge>
						))}
					{!isTop3 && isTop10 && (
						<Badge variant="outline" className="text-xs">
							Top 10
						</Badge>
					)}

					{/* Online Status */}
					<OnlineStatus isOnline={player.isOnline} />
				</div>

				{(player.city || player.state || player.company) && (
					<div
						className="mb-2 truncate text-muted-foreground text-xs"
						aria-label="Location and company"
					>
						<span>
							{player.city ? `${player.city}` : ""}
							{player.city && player.state ? ", " : ""}
							{player.state ?? ""}
						</span>
						{(player.city || player.state) && player.company ? " • " : ""}
						<span>{player.company ?? ""}</span>
					</div>
				)}
				{isChampion && (
					<div className="mb-2 text-destructive text-xs">
						You're #1 — others are closing in. Hold the lead!
					</div>
				)}

				{/* Row 1: Prediction + Reputation */}
				<div className="flex items-center gap-2">
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
										"border-green-200 text-green-600",
									player.reputationDelta === -1 &&
										"border-red-200 text-red-600",
									player.reputationDelta === 0 &&
										"border-muted text-muted-foreground",
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

				{/* Row 2: Outbound icons */}
				<div
					className="mt-2 flex items-center gap-2"
					aria-label="Outbound actions"
				>
					{/* Chat */}
					<Button
						type="button"
						asChild
						variant="ghost"
						size="icon"
						className="h-8 w-8"
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
						className="h-8 w-8"
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
						className="h-8 w-8"
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
				</div>

				{/* Row 3: Request/Donation chips */}
				<div
					className="mt-2 flex items-center gap-2"
					aria-label="Credit actions"
				>
					{canRequestCredits && <CreditRequestPopover player={player} />}
					{!isTop10 && <DonationPopover player={player} />}
				</div>
			</div>

			{/* Score */}
			<div className={cn(isChampion && "scale-[1.05] drop-shadow-sm")}>
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
				/>
			</div>
		</MotionDiv>
	);
};
