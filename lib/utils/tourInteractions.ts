const APP_TOUR_SELECTORS = [
	"[data-app-tour-tooltip]",
	"[data-app-tour-overlay]",
	"[data-app-tour-spotlight]",
	"[data-app-tour-completion]",
] as const;

const isElement = (value: EventTarget | null): value is Element =>
	typeof Element !== "undefined" && value instanceof Element;

let lastAppTourInteractionAt = 0;

function eventTargetsAppTourChrome(event: Event) {
	const target = event.target;

	if (
		isElement(target) &&
		APP_TOUR_SELECTORS.some((selector) => target.closest(selector))
	) {
		return true;
	}

	const path =
		typeof event.composedPath === "function" ? event.composedPath() : [];

	return path.some(
		(entry) =>
			isElement(entry) &&
			APP_TOUR_SELECTORS.some((selector) => entry.closest(selector)),
	);
}

export function isAppTourEvent(event: Event) {
	if (eventTargetsAppTourChrome(event)) {
		return true;
	}

	const originalEvent = (
		event as Event & { detail?: { originalEvent?: Event } }
	).detail?.originalEvent;

	return originalEvent ? eventTargetsAppTourChrome(originalEvent) : false;
}

export function markAppTourInteraction() {
	lastAppTourInteractionAt =
		typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function shouldIgnoreAppTourDismiss() {
	const now =
		typeof performance !== "undefined" ? performance.now() : Date.now();

	return now - lastAppTourInteractionAt < 750;
}
