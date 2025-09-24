import type { StateCreator } from "zustand";

// Lightweight analytics bridge for Zustand stores
// - Sends event metadata to PostHog (if window.posthog exists and is enabled)
// - Sends event metadata to Microsoft Clarity (if window.clarity exists and is enabled)
// - Never throws; always no-ops in SSR/tests

const MAX_DIFF_KEYS = 20;

function isBrowser(): boolean {
	return typeof window !== "undefined";
}

function safeCapture(event: string, props: Record<string, unknown>): void {
	if (!isBrowser()) return;
	try {
		const enablePosthog = process?.env?.NEXT_PUBLIC_ENABLE_POSTHOG === "true";
		const enableClarity = process?.env?.NEXT_PUBLIC_ENABLE_CLARITY === "true";

		if (enablePosthog) {
			// Optional chaining to avoid calls before init
			window.posthog?.capture?.(event, props);
		}
		if (enableClarity && typeof window.clarity === "function") {
			window.clarity("event", event, props);
		}
	} catch {
		// Swallow analytics errors
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function shallowDiffKeys(prev: unknown, next: unknown): string[] {
	try {
		const prevObj = isRecord(prev) ? prev : {};
		const nextObj = isRecord(next) ? next : {};
		const keys = new Set<string>([
			...Object.keys(prevObj),
			...Object.keys(nextObj),
		]);
		const changed: string[] = [];
		for (const k of keys) {
			if (
				(prevObj as Record<string, unknown>)[k] !==
				(nextObj as Record<string, unknown>)[k]
			) {
				changed.push(k);
			}
			if (changed.length >= MAX_DIFF_KEYS) break;
		}
		return changed;
	} catch {
		return [];
	}
}

export function withAnalytics<T extends object>(
	storeName: string,
	initializer: StateCreator<T>,
): StateCreator<T> {
	return (set, get, api) => {
		const wrappedSet: typeof set = (partial, replace) => {
			const before = get();
			set(partial, replace);
			const after = get();
			const keys = shallowDiffKeys(before, after);
			safeCapture("zustand_set", {
				store: storeName,
				keys,
				count: keys.length,
			});
		};

		return initializer(wrappedSet, get, api);
	};
}
