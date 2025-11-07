import { describe, expect, it, beforeEach, vi } from "vitest";

import {
	openFocusWidget,
	openHelpModal,
	showHelpIcon,
} from "@/lib/ui/helpActions";
import {
	resetMusicPreferencesStore,
	useMusicPreferencesStore,
} from "@/lib/stores/musicPreferences";

describe("helpActions utilities", () => {
	beforeEach(() => {
		resetMusicPreferencesStore();
		vi.restoreAllMocks();
	});

	it("dispatches the help icon reveal event", () => {
		const dispatchSpy = vi.spyOn(window, "dispatchEvent");

		showHelpIcon();

		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({ type: "dealScale:helpFab:show" }),
		);
	});

	it("dispatches the help modal open event", () => {
		const dispatchSpy = vi.spyOn(window, "dispatchEvent");

		openHelpModal();

		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({ type: "dealScale:helpFab:openModal" }),
		);
	});

	it("enables the focus widget without overriding a custom provider", () => {
		const store = useMusicPreferencesStore.getState();
		store.setProvider("internal");
		store.setMode("voice");
		store.setEnabled(false);

		openFocusWidget();

		const next = useMusicPreferencesStore.getState();
		expect(next.preferences.enabled).toBe(true);
		expect(next.preferences.provider).toBe("internal");
		expect(next.mode).toBe("music");
	});

	it("sets a sensible default provider when none is configured", () => {
		const store = useMusicPreferencesStore.getState();
		store.setProvider(null);
		store.setEnabled(false);

		openFocusWidget();

		expect(useMusicPreferencesStore.getState().preferences.provider).toBe(
			"internal",
		);
	});
});
