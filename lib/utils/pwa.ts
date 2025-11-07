export function isClient(): boolean {
	return typeof window !== "undefined";
}

export function hasServiceWorkerSupport(): boolean {
	return isClient() && "serviceWorker" in navigator;
}

export function isPushSupported(): boolean {
	return (
		hasServiceWorkerSupport() &&
		"Notification" in window &&
		"PushManager" in window
	);
}

export function isStandaloneMode(): boolean {
	if (!isClient()) return false;
	const displayModeStandalone = window.matchMedia
		? window.matchMedia("(display-mode: standalone)").matches
		: false;
	const navigatorStandalone = (
		window.navigator as unknown as {
			standalone?: boolean;
		}
	).standalone;
	return Boolean(displayModeStandalone || navigatorStandalone);
}

export function isIosDevice(): boolean {
	if (!isClient()) return false;
	return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function isNotificationDenied(): boolean {
	if (!isClient() || !("Notification" in window)) return false;
	return Notification.permission === "denied";
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData =
		typeof window !== "undefined"
			? window.atob(base64)
			: (globalThis.Buffer?.from(base64, "base64").toString("binary") ?? "");
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; i += 1) {
		outputArray[i] = rawData.charCodeAt(i);
	}

	return outputArray;
}

export function getSupportSummary(): {
	push: boolean;
	notification: boolean;
	serviceWorker: boolean;
} {
	return {
		push: isPushSupported(),
		notification: isClient() && "Notification" in window,
		serviceWorker: hasServiceWorkerSupport(),
	};
}
