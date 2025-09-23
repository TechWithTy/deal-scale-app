import { type CommandItem } from "./types";

export type AISuggestion = {
	id: string;
	label: string;
	hint?: string;
	actionPath?: string; // optional path to navigate to
};

export async function fetchAISuggestions(
	query: string,
	ctxPath: string,
	endpoint = "/api/ai/command-suggest",
): Promise<AISuggestion[]> {
	if (!query || query.trim().length < 2) return [];
	try {
		const url = new URL(endpoint, window.location.origin);
		url.searchParams.set("q", query);
		url.searchParams.set("ctx", ctxPath);
		const token =
			typeof window !== "undefined" ? window.DealActionBar?.token : undefined;
		const headers: HeadersInit = token
			? { Authorization: `Bearer ${token}` }
			: {};
		const res = await fetch(url.toString(), { headers });
		if (!res.ok) return [];
		const data = (await res.json()) as { suggestions: AISuggestion[] };
		return data.suggestions ?? [];
	} catch {
		return [];
	}
}

export function aiToCommandItems(
	suggestions: AISuggestion[],
	run: (path?: string) => void,
): CommandItem[] {
	return suggestions.map((s) => ({
		id: `ai-${s.id}`,
		group: "AI Suggestions",
		label: s.label,
		hint: s.hint,
		action: () => run(s.actionPath),
		role: "any",
		keywords: ["ai", "suggested"],
	}));
}
