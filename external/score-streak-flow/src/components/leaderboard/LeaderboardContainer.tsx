import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LeaderboardTable } from "./LeaderboardTable";
import { YourRankCard } from "./YourRankCard";
import { PlayerToWatchAlert } from "../ai/PlayerToWatchAlert";
import { useLeaderboard } from "../realtime/useLeaderboard";
import { leaderboardConfig } from "./config";
import { Button } from "@root/components/ui/button";
import { LeaderboardHeader } from "./LeaderboardHeader";
import { LeaderboardSettingsPanel } from "./LeaderboardSettingsPanel";
import { TableToolbar } from "./TableToolbar";
import { LeaderboardFooter } from "./LeaderboardFooter";
import {
	LeaderboardFilters,
	type TimePeriod,
	type LeaderboardType,
} from "./LeaderboardFilters";

function safeSetLocalStorage(key: string, value: string) {
	try {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(key, value);
		}
	} catch {
		/* noop: localStorage persistence is optional */
	}
}
export const LeaderboardContainer = () => {
	const {
		players,
		totalPlayers,
		myRank,
		lastUpdated,
		isConnected,
		reconnect,
		isPaused,
		pause,
		resume,
	} = useLeaderboard();

	const [settings, setSettings] = useState(leaderboardConfig);
	const [animationEnabled, setAnimationEnabled] = useState(false);
	const pageSizeOptions = [10, 25, 50, 100] as const;
	const [pageSize, setPageSize] = useState<number>(10);
	const [visibleCount, setVisibleCount] = useState<number>(10);

	// Filter states
	const [timePeriod, setTimePeriod] = useState<TimePeriod>("week");
	const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("individual");

	// Throttled snapshot of live data, updated at settings.refreshIntervalMs
	const [throttledPlayers, setThrottledPlayers] = useState(players);
	const [throttledTotalPlayers, setThrottledTotalPlayers] =
		useState(totalPlayers);
	const [throttledLastUpdated, setThrottledLastUpdated] = useState(lastUpdated);

	// Apply filters to players
	const filteredPlayers = useMemo(() => {
		let filtered = [...throttledPlayers];

		// Filter by time period (mock: adjust scores based on period)
		if (timePeriod === "today") {
			// Show only recent high performers
			filtered = filtered.filter((p) => p.score > 80000);
		} else if (timePeriod === "week") {
			// Default view - show all
		} else if (timePeriod === "month") {
			// Show top 50 for monthly
			filtered = filtered.slice(0, 50);
		}
		// alltime shows everything

		// Group by leaderboard type
		if (leaderboardType === "team") {
			// Group by company and sum scores
			const teamScores = new Map<string, { score: number; players: typeof filtered }>();
			
			filtered.forEach((player) => {
				const company = player.company || "Unknown";
				const existing = teamScores.get(company);
				if (existing) {
					existing.score += player.score;
					existing.players.push(player);
				} else {
					teamScores.set(company, { score: player.score, players: [player] });
				}
			});

			// Convert to team leaderboard format (show best player from each team)
			filtered = Array.from(teamScores.entries())
				.map(([company, data]) => {
					// Get the best player from this company
					const bestPlayer = data.players.reduce((best, current) =>
						current.score > best.score ? current : best
					);
					// Use the best player but represent the whole team
					return {
						...bestPlayer,
						username: company,
						score: data.score,
					};
				})
				.sort((a, b) => b.score - a.score)
				.slice(0, Math.min(settings.maxPlayers, 20)); // Show top 20 teams
		} else if (leaderboardType === "regional") {
			// Group by state
			const regionalScores = new Map<string, { score: number; players: typeof filtered }>();
			
			filtered.forEach((player) => {
				const region = player.state || "Unknown";
				const existing = regionalScores.get(region);
				if (existing) {
					existing.score += player.score;
					existing.players.push(player);
				} else {
					regionalScores.set(region, { score: player.score, players: [player] });
				}
			});

			// Convert to regional leaderboard
			filtered = Array.from(regionalScores.entries())
				.map(([state, data]) => {
					const bestPlayer = data.players.reduce((best, current) =>
						current.score > best.score ? current : best
					);
					return {
						...bestPlayer,
						username: `${state} Region`,
						score: data.score,
						company: `${data.players.length} agents`,
					};
				})
				.sort((a, b) => b.score - a.score)
				.slice(0, Math.min(settings.maxPlayers, 20)); // Show top 20 regions
		}

		// Re-rank filtered players
		filtered.forEach((player, index) => {
			player.rank = index + 1;
		});

		return filtered;
	}, [throttledPlayers, timePeriod, leaderboardType, settings.maxPlayers]);

	const latestRef = React.useRef({ players, totalPlayers, lastUpdated });
	React.useEffect(() => {
		latestRef.current = { players, totalPlayers, lastUpdated };
	});

	React.useEffect(() => {
		// Sync immediately when interval changes
		setThrottledPlayers(latestRef.current.players);
		setThrottledTotalPlayers(latestRef.current.totalPlayers);
		setThrottledLastUpdated(latestRef.current.lastUpdated);

		const interval = window.setInterval(
			() => {
				setThrottledPlayers(latestRef.current.players);
				setThrottledTotalPlayers(latestRef.current.totalPlayers);
				setThrottledLastUpdated(latestRef.current.lastUpdated);
			},
			Math.max(60000, settings.refreshIntervalMs),
		);
		return () => window.clearInterval(interval);
	}, [settings.refreshIntervalMs]);

	const displayedPlayers = useMemo(() => {
		const limit = Math.min(settings.maxPlayers, visibleCount);
		return filteredPlayers.slice(0, limit);
	}, [filteredPlayers, settings.maxPlayers, visibleCount]);

	// Clamp visible count if data or max limit shrinks
	React.useEffect(() => {
		const maxAllowed = Math.min(settings.maxPlayers, players.length);
		setVisibleCount((c) => Math.min(c, maxAllowed));
	}, [settings.maxPlayers, players.length]);

	// When page size changes, ensure visible count is at least the page size,
	// but never exceed the current maxAllowed to avoid a ping-pong loop with the clamp effect.
	React.useEffect(() => {
		const maxAllowed = Math.min(settings.maxPlayers, players.length);
		setVisibleCount((c) => {
			const next = Math.min(Math.max(c, pageSize), maxAllowed);
			return next === c ? c : next;
		});
	}, [pageSize, settings.maxPlayers, players.length]);

	// Persist animationEnabled in localStorage and restore on mount
	React.useEffect(() => {
		try {
			const saved = window.localStorage.getItem(
				"leaderboard:animationsEnabled",
			);
			if (saved !== null) {
				setAnimationEnabled(saved === "true");
			}
			const savedPageSize = window.localStorage.getItem("leaderboard:pageSize");
			if (savedPageSize) setPageSize(Number.parseInt(savedPageSize));
			const savedVisibleCount = window.localStorage.getItem(
				"leaderboard:visibleCount",
			);
			if (savedVisibleCount)
				setVisibleCount(Number.parseInt(savedVisibleCount));
		} catch (_) {
			// ignore storage errors
		}
	}, []);

	React.useEffect(() => {
		try {
			window.localStorage.setItem(
				"leaderboard:animationsEnabled",
				String(animationEnabled),
			);
		} catch (_) {
			// ignore storage errors
		}
	}, [animationEnabled]);

	// Persist paging controls
	React.useEffect(() => {
		safeSetLocalStorage("leaderboard:pageSize", String(pageSize));
	}, [pageSize]);

	React.useEffect(() => {
		safeSetLocalStorage("leaderboard:visibleCount", String(visibleCount));
	}, [visibleCount]);
	// Sync provider pause/resume with animationEnabled
	// Only depend on animationEnabled to avoid effect loops if pause/resume identities change per render.
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		if (animationEnabled) {
			resume();
		} else {
			pause();
		}
		// After toggling, immediately sync throttled snapshots so UI doesn't wait for next interval
		setThrottledPlayers(latestRef.current.players);
		setThrottledTotalPlayers(latestRef.current.totalPlayers);
		setThrottledLastUpdated(latestRef.current.lastUpdated);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [animationEnabled]);

	// If live data becomes available while throttled snapshots are empty, do a one-time immediate sync
	React.useEffect(() => {
		const hasLiveData =
			players.length > 0 || totalPlayers > 0 || lastUpdated !== undefined;
		const throttledEmpty =
			throttledPlayers.length === 0 && throttledTotalPlayers === 0;
		if (hasLiveData && throttledEmpty) {
			setThrottledPlayers(players);
			setThrottledTotalPlayers(totalPlayers);
			setThrottledLastUpdated(lastUpdated);
		}
		// Only run when live data or throttled emptiness changes
	}, [
		players,
		totalPlayers,
		lastUpdated,
		throttledPlayers.length,
		throttledTotalPlayers,
	]);

	// Keyboard shortcut: Space toggles animations (ignores inputs/selects/textarea/contentEditable)
	React.useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			const tag = (target?.tagName || "").toLowerCase();
			const isFormField =
				tag === "input" ||
				tag === "textarea" ||
				tag === "select" ||
				target?.isContentEditable;
			if (isFormField) return;

			if (e.code === "Space" || e.key === " ") {
				e.preventDefault();
				setAnimationEnabled((prev) => !prev);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<div className="min-h-screen bg-gradient-bg p-2 sm:p-4 md:p-6 lg:p-8">
			<div className="mx-auto max-w-4xl space-y-3 sm:space-y-4 md:space-y-6">
				{/* Header */}
				<LeaderboardHeader
					animationEnabled={animationEnabled}
					settings={{
						animationDuration: settings.animationDuration,
						headerDelay: settings.headerDelay,
					}}
					isConnected={isConnected}
					isPaused={isPaused}
					lastUpdated={throttledLastUpdated}
					reconnect={reconnect}
				/>

				{/* Your Rank Card */}
				<YourRankCard
					rank={myRank}
					totalPlayers={throttledTotalPlayers}
					isOnline={isConnected}
				/>

			{/* AI Player to Watch Alert */}
			<PlayerToWatchAlert players={players} />

			{/* Leaderboard Filters */}
			<LeaderboardFilters
				timePeriod={timePeriod}
				onTimePeriodChange={setTimePeriod}
				leaderboardType={leaderboardType}
				onLeaderboardTypeChange={setLeaderboardType}
				currentUserRank={myRank}
				currentUserId="current-user"
				currentUserName="You"
			/>

			<LeaderboardSettingsPanel
				animationEnabled={animationEnabled}
				setAnimationEnabled={setAnimationEnabled}
				settings={settings}
				setSettings={setSettings}
			/>

				{/* Leaderboard Table */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: animationEnabled ? settings.animationDuration : 0,
						delay: animationEnabled ? settings.tableDelay : 0,
					}}
					className="space-y-4"
				>
				<TableToolbar
					title={`Top ${Math.min(filteredPlayers.length, visibleCount)} ${leaderboardType === "team" ? "Teams" : leaderboardType === "regional" ? "Regions" : "Players"}`}
					displayedCount={displayedPlayers.length}
					pageSize={pageSize}
					setPageSize={setPageSize}
					pageSizeOptions={pageSizeOptions}
				/>

					<LeaderboardTable
						players={displayedPlayers}
						rowDuration={animationEnabled ? settings.tableRowDuration : 0}
						rowDelayMultiplier={
							animationEnabled ? settings.tableRowDelayMultiplier : 0
						}
					/>
				</motion.div>

			{/* Load More */}
			{visibleCount <
				Math.min(settings.maxPlayers, filteredPlayers.length) && (
					<div className="mt-4 flex justify-center">
						<Button
							type="button"
							size="sm"
							onClick={() => {
								const maxAllowed = Math.min(
									settings.maxPlayers,
									throttledPlayers.length,
								);
								setVisibleCount((c) => Math.min(c + pageSize, maxAllowed));
							}}
						>
							Load more
						</Button>
					</div>
				)}

				<LeaderboardFooter
					animationEnabled={animationEnabled}
					settings={{
						animationDuration: settings.animationDuration,
						footerDelay: settings.footerDelay,
					}}
					totalPlayers={throttledTotalPlayers}
					maxPlayers={settings.maxPlayers}
				/>
			</div>
		</div>
	);
};
