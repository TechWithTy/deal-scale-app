import { render, screen } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import LeaderboardDropdown from "@/components/navbar/LeaderboardDropdown";
import { useGamificationStore } from "@/lib/stores/gamification";

describe("LeaderboardDropdown rank styling", () => {
	beforeEach(() => {
		act(() => {
			useGamificationStore.setState({
				lastKnownRank: null,
				currentRank: null,
				hasRankChanged: false,
			});
			if (typeof window !== "undefined") {
				window.localStorage.clear();
			}
		});
	});

	it("applies gold highlight when the user is first place", () => {
		act(() => {
			useGamificationStore.getState().setCurrentRank(1);
		});

		render(<LeaderboardDropdown />);

		const trigger = screen.getByRole("button", {
			name: /open leaderboard/i,
		});
		expect(trigger.getAttribute("aria-label")).toContain("#1");

		const badge = screen.getByText("1");
		expect(badge).toHaveClass("text-amber-950");
		expect(badge).toHaveClass("bg-gradient-to-br");
	});

	it("applies blue highlight when the user is second place", () => {
		act(() => {
			useGamificationStore.getState().setCurrentRank(2);
		});

		render(<LeaderboardDropdown />);

		const trigger = screen.getByRole("button", {
			name: /open leaderboard/i,
		});
		expect(trigger.getAttribute("aria-label")).toContain("#2");

		const badge = screen.getByText("2");
		expect(badge).toHaveClass("text-blue-950");
		expect(badge).toHaveClass("bg-gradient-to-br");
	});

	it("applies red highlight when the user is third place", () => {
		act(() => {
			useGamificationStore.getState().setCurrentRank(3);
		});

		render(<LeaderboardDropdown />);

		const trigger = screen.getByRole("button", {
			name: /open leaderboard/i,
		});
		expect(trigger.getAttribute("aria-label")).toContain("#3");

		const badge = screen.getByText("3");
		expect(badge).toHaveClass("text-red-950");
		expect(badge).toHaveClass("bg-gradient-to-br");
	});

	it("does not show a badge when the rank is outside the top three", () => {
		act(() => {
			useGamificationStore.getState().setCurrentRank(5);
		});

		render(<LeaderboardDropdown />);

		expect(screen.queryByText("5")).toBeNull();
	});
});


