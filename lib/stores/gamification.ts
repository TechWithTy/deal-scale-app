/**
 * Gamification Store
 * Tracks leaderboard rank changes and wheel spinner availability for navbar indicators
 */

import { createWithEqualityFn } from "zustand/traditional";
import { withAnalytics } from "./_middleware/analytics";

interface GamificationState {
	// Leaderboard tracking
	lastKnownRank: number | null;
	currentRank: number | null;
	hasRankChanged: boolean;
	setCurrentRank: (rank: number | null) => void;
	setLastKnownRank: (rank: number) => void;
	checkRankChange: (currentRank: number) => boolean;
	clearRankChangeIndicator: () => void;

	// Wheel spinner tracking
	isSpinAvailable: boolean;
	lastSpinCheck: number;
	checkSpinAvailability: (
		userId: string,
		cadence: "daily" | "weekly" | "monthly",
	) => boolean;
	markSpinAsViewed: () => void;
}

/**
 * Check if wheel spin is available based on cadence and last spin time
 */
function isWheelSpinAvailable(
	userId: string,
	cadence: "daily" | "weekly" | "monthly",
): boolean {
	try {
		if (typeof window === "undefined") return false;

		const storageKey = `prize-wheel-${userId}-${cadence}`;
		const lastSpinStr = window.localStorage.getItem(storageKey);

		if (!lastSpinStr) return true; // Never spun before

		const lastSpinAt = new Date(lastSpinStr);
		const now = new Date();

		switch (cadence) {
			case "daily": {
				const nextDay = new Date(lastSpinAt);
				nextDay.setHours(24, 0, 0, 0);
				return now >= nextDay;
			}
			case "weekly": {
				const nextWeek = new Date(lastSpinAt);
				nextWeek.setDate(nextWeek.getDate() + 7);
				return now >= nextWeek;
			}
			case "monthly": {
				const nextMonth = new Date(lastSpinAt);
				nextMonth.setMonth(nextMonth.getMonth() + 1);
				return now >= nextMonth;
			}
			default:
				return false;
		}
	} catch {
		return false;
	}
}

export const useGamificationStore = createWithEqualityFn<GamificationState>(
	withAnalytics<GamificationState>("gamification", (set, get) => ({
		// Leaderboard state
		lastKnownRank: null,
		currentRank: null,
		hasRankChanged: false,

		setCurrentRank: (rank: number | null) => {
			set({ currentRank: rank });
		},

		setLastKnownRank: (rank: number) => {
			try {
				if (typeof window !== "undefined") {
					window.localStorage.setItem("ds-last-rank", rank.toString());
				}
			} catch {}
			set({
				lastKnownRank: rank,
				currentRank: rank,
				hasRankChanged: false,
			});
		},

		checkRankChange: (currentRank: number) => {
			const state = get();
			const lastRank = state.lastKnownRank;
			set({ currentRank });

			// Load from localStorage if not in memory
			let previousRank = lastRank;
			if (previousRank === null && typeof window !== "undefined") {
				try {
					const stored = window.localStorage.getItem("ds-last-rank");
					if (stored) {
						const storedRank = Number.parseInt(stored, 10);
						if (!Number.isNaN(storedRank)) {
							previousRank = storedRank;
							set({ lastKnownRank: storedRank });
						}
					}
				} catch {}
			}

			if (previousRank !== null && previousRank !== currentRank) {
				set({ hasRankChanged: true });
				return true;
			}

			set({ hasRankChanged: false });
			return false;
		},

		clearRankChangeIndicator: () => {
			const { currentRank } = get();
			if (typeof currentRank === "number" && !Number.isNaN(currentRank)) {
				try {
					if (typeof window !== "undefined") {
						window.localStorage.setItem("ds-last-rank", currentRank.toString());
					}
				} catch {
					/* noop */
				}
				set({
					hasRankChanged: false,
					lastKnownRank: currentRank,
				});
				return;
			}

			set({ hasRankChanged: false });
		},

		// Wheel spinner state
		isSpinAvailable: false,
		lastSpinCheck: 0,

		checkSpinAvailability: (
			userId: string,
			cadence: "daily" | "weekly" | "monthly",
		) => {
			const now = Date.now();
			const state = get();

			// Cache check for 1 minute
			if (now - state.lastSpinCheck < 60000) {
				return state.isSpinAvailable;
			}

			const available = isWheelSpinAvailable(userId, cadence);
			set({ isSpinAvailable: available, lastSpinCheck: now });
			return available;
		},

		markSpinAsViewed: () => {
			set({ isSpinAvailable: false });
		},
	})),
	Object.is,
);
