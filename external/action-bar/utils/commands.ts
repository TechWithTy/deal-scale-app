import { type CommandItem } from "./types";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function baseGlobalCommands(router: AppRouterInstance): CommandItem[] {
	return [
		{
			id: "go-home",
			group: "Navigation",
			label: "Home",
			shortcut: "G H",
			action: () => router.push("/"),
			role: "any",
			keywords: ["root", "dashboard"],
		},
		{
			id: "go-leaderboard",
			group: "Navigation",
			label: "Leaderboard",
			shortcut: "G L",
			action: () => router.push("/app/dashboard/leaderboard"),
			role: "any",
			keywords: ["rank", "top", "players"],
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
				action: () => router.push("/app/dashboard/leaderboard?focus=me"),
				role: "auth",
			},
			{
				id: "players-to-watch",
				group: "Leaderboard",
				label: "Players to Watch (AI)",
				shortcut: "A I",
				action: () =>
					router.push("/app/dashboard/leaderboard?ai=players-to-watch"),
				role: "any",
			},
		];
	}
	return [];
}
