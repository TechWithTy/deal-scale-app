import { createElement } from "react";
import { Home, Medal, Sparkles, Trophy } from "lucide-react";

import { useModalStore } from "@/lib/stores/dashboard";
import type { CommandItem } from "./types";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const ICON_CLASS = "h-4 w-4";

export function baseGlobalCommands(router: AppRouterInstance): CommandItem[] {
	return [
		{
			id: "go-home",
			group: "Navigation",
			label: "Home",
			shortcut: "G H",
			icon: createElement(Home, { className: ICON_CLASS, "aria-hidden": true }),
			action: () => router.push("/"),
			role: "any",
			keywords: ["root", "dashboard"],
		},
		{
			id: "go-leaderboard",
			group: "Navigation",
			label: "Leaderboard",
			shortcut: "G L",
			icon: createElement(Trophy, {
				className: ICON_CLASS,
				"aria-hidden": true,
			}),
			action: () => {
				useModalStore.getState().openLeaderboardModal();
			},
			role: "any",
			keywords: ["rank", "top", "players"],
		},
		{
			id: "go-daily-spin",
			group: "Navigation",
			label: "Daily Spin",
			shortcut: "G D",
			icon: createElement(Sparkles, {
				className: ICON_CLASS,
				"aria-hidden": true,
			}),
			action: () => {
				useModalStore.getState().openWheelSpinnerModal();
			},
			role: "any",
			keywords: ["wheel", "credits", "spin"],
		},
	];
}

export function pageScopedCommands(
	path: string,
	router: AppRouterInstance,
): CommandItem[] {
	if (path.includes("/dashboard/leaderboard")) {
		return [
			{
				id: "view-my-rank",
				group: "Leaderboard",
				label: "View My Rank",
				shortcut: "M R",
				icon: createElement(Medal, {
					className: ICON_CLASS,
					"aria-hidden": true,
				}),
				action: () => router.push("/app/dashboard/leaderboard?focus=me"),
				role: "auth",
			},
			{
				id: "players-to-watch",
				group: "Leaderboard",
				label: "Players to Watch (AI)",
				shortcut: "A I",
				icon: createElement(Sparkles, {
					className: ICON_CLASS,
					"aria-hidden": true,
				}),
				action: () =>
					router.push("/app/dashboard/leaderboard?ai=players-to-watch"),
				role: "any",
			},
		];
	}
	return [];
}
