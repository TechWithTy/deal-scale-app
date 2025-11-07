import { useMusicPreferencesStore } from "@/lib/stores/musicPreferences";

const HELP_ICON_EVENT = "dealScale:helpFab:show";
const HELP_MODAL_EVENT = "dealScale:helpFab:openModal";

function dispatchAppEvent(type: string) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new Event(type));
}

export function showHelpIcon(): void {
	dispatchAppEvent(HELP_ICON_EVENT);
}

export function openHelpModal(): void {
	dispatchAppEvent(HELP_MODAL_EVENT);
}

export function openFocusWidget(): void {
	const { preferences, setEnabled, setMode, setProvider } =
		useMusicPreferencesStore.getState();
	console.debug("[FocusWidget] openFocusWidget invoked", {
		enabled: preferences.enabled,
		provider: preferences.provider,
		mode: useMusicPreferencesStore.getState().mode,
	});
	setEnabled(true);
	if (!preferences.provider) {
		setProvider("internal");
	}
	setMode("music");
	const afterState = useMusicPreferencesStore.getState();
	console.debug("[FocusWidget] state after enable", {
		enabled: afterState.preferences.enabled,
		provider: afterState.preferences.provider,
		mode: afterState.mode,
	});
	dispatchAppEvent("dealScale:musicWidget:show");
}
