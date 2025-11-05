/** SSR-safe helpers for Supademo interactions. */

export function isBrowser(): boolean {
	return typeof window !== "undefined" && typeof document !== "undefined";
}

/** Temporarily disable global Supademo overlay to avoid double-open when using in-app modals. */
export function suppressSupademoOverlay(): void {
	if (!isBrowser()) return;
	interface SupademoGlobal {
		open?: (id: string) => void;
	}
	const w = window as unknown as {
		Supademo?: SupademoGlobal;
		__SupademoBackup__?: SupademoGlobal;
	};
	if (
		typeof w.Supademo !== "undefined" &&
		typeof w.__SupademoBackup__ === "undefined"
	) {
		w.__SupademoBackup__ = w.Supademo;
		w.Supademo = { open: (_id: string) => undefined };
	}
}

/** Restore Supademo overlay if previously suppressed. */
export function restoreSupademoOverlay(): void {
	if (!isBrowser()) return;
	interface SupademoGlobal {
		open?: (id: string) => void;
	}
	const w = window as unknown as {
		Supademo?: SupademoGlobal;
		__SupademoBackup__?: SupademoGlobal;
	};
	if (typeof w.__SupademoBackup__ !== "undefined") {
		w.Supademo = w.__SupademoBackup__;
		w.__SupademoBackup__ = undefined;
	}
}

/** Open Supademo fullscreen overlay safely with fallback to new tab. */
export function openSupademoFullscreen(demoId: string): void {
	if (!demoId) return;
	if (!isBrowser()) return;
	try {
		const w = window as unknown as {
			Supademo?: { open?: (id: string) => void };
		};
		if (w?.Supademo?.open) {
			w.Supademo.open(demoId);
			return;
		}
	} catch {}
	// Fallback: open new tab embed
	try {
		window.open(
			`https://app.supademo.com/embed/${demoId}?embed_v=2&utm_source=embed`,
			"_blank",
			"noopener,noreferrer",
		);
	} catch {}
}
