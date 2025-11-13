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

export interface OpenFocusWidgetOptions {
	/**
	 * When true, expand the voice view and promote the voice connection
	 * state so assistive technology users land inside an active session.
	 */
	autoStartVoice?: boolean;
}

export function openFocusWidget(options?: OpenFocusWidgetOptions): void {
	const {
		preferences,
		setEnabled,
		setMode,
		setProvider,
		setWidgetView,
		setVoiceStatus,
		mode,
	} = useMusicPreferencesStore.getState();

	console.debug("[FocusWidget] openFocusWidget invoked", {
		enabled: preferences.enabled,
		provider: preferences.provider,
		mode,
		autoStartVoice: options?.autoStartVoice ?? false,
	});

	setEnabled(true);
	if (!preferences.provider) {
		setProvider("internal");
	}

	setMode("voice");
	setWidgetView("music", "default");
	setWidgetView("voice", options?.autoStartVoice ? "maximized" : "default");

	if (options?.autoStartVoice) {
		setVoiceStatus("streaming", { force: true });
	}

	const afterState = useMusicPreferencesStore.getState();
	console.debug("[FocusWidget] state after enable", {
		enabled: afterState.preferences.enabled,
		provider: afterState.preferences.provider,
		mode: afterState.mode,
		autoStartVoice: options?.autoStartVoice ?? false,
	});

	dispatchAppEvent("dealScale:musicWidget:show");
	if (options?.autoStartVoice) {
		dispatchAppEvent("dealScale:musicWidget:autoStartVoice");
	}
}
