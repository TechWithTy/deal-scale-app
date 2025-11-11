"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { usePushStore } from "@/lib/stores/pushStore";
import {
	getVapidPublicKey,
	persistSubscription,
	removeSubscription,
} from "@/lib/services/pushClient";
import {
	getSupportSummary,
	isNotificationDenied,
	isPushSupported,
	urlBase64ToUint8Array,
} from "@/lib/utils/pwa";

type PermissionRequestDetail = {
	metadata?: Record<string, string | number | boolean | null>;
	showToast?: boolean;
};

type PermissionRequestEvent = CustomEvent<PermissionRequestDetail>;

interface UsePushManagerResult {
	isSupported: boolean;
	permission: NotificationPermission;
	isRegistering: boolean;
	subscription: PushSubscriptionJSON | null;
	requestPermission: (detail?: PermissionRequestDetail) => Promise<void>;
	unregister: () => Promise<void>;
}

async function ensureRegistration(): Promise<ServiceWorkerRegistration> {
	if (!navigator.serviceWorker) {
		throw new Error("Service worker is not available in this environment.");
	}
	return navigator.serviceWorker.ready;
}

async function createSubscription(): Promise<PushSubscription> {
	const registration = await ensureRegistration();
	const existing = await registration.pushManager.getSubscription();
	if (existing) return existing;

	const vapidKey = getVapidPublicKey();
	if (!vapidKey) {
		throw new Error("Missing VAPID public key configuration.");
	}

	const applicationServerKey = urlBase64ToUint8Array(vapidKey);

	return registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey,
	});
}

export function usePushManager(): UsePushManagerResult {
	const {
		isSupported,
		permission,
		subscription,
		isRegistering,
		setSupported,
		setPermission,
		setSubscription,
		setRegistering,
		recordPrompt,
		reset,
	} = usePushStore();

	const [initialized, setInitialized] = useState(false);
	const isMounted = useRef(false);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		const summary = getSupportSummary();
		setSupported(summary.push);
		if (!summary.push) {
			setPermission("denied");
			return;
		}
		setPermission(Notification.permission);

		ensureRegistration()
			.then(async (registration) => {
				const existing = await registration.pushManager.getSubscription();
				if (existing && isMounted.current) {
					setSubscription(existing);
				}
			})
			.catch((error) => {
				console.warn("Failed to resolve service worker registration", error);
			})
			.finally(() => {
				if (isMounted.current) {
					setInitialized(true);
				}
			});
	}, [setPermission, setSubscription, setSupported]);

	const handlePermissionResult = useCallback(
		async (state: NotificationPermission, detail?: PermissionRequestDetail) => {
			setPermission(state);
			if (state !== "granted") {
				if (detail?.showToast) {
					toast.error(
						state === "denied"
							? "Notifications are blocked. Enable them in your browser settings to receive alerts."
							: "Notifications were dismissed. You can enable them later from settings.",
					);
				}
				return;
			}

			try {
				const activeSubscription = await createSubscription();
				const data = activeSubscription.toJSON();
				setSubscription(data);
				await persistSubscription(data, detail?.metadata);
				if (detail?.showToast) {
					toast.success("Push notifications enabled. We'll keep you posted.");
				}
			} catch (error) {
				console.error("Failed to create push subscription", error);
				if (detail?.showToast) {
					toast.error(
						"We couldn't enable notifications. Please try again later.",
					);
				}
			}
		},
		[setPermission, setSubscription],
	);

	const requestPermission = useCallback(
		async (detail?: PermissionRequestDetail) => {
			if (!isPushSupported()) {
				setSupported(false);
				if (detail?.showToast) {
					toast.error("Push notifications are not supported on this device.");
				}
				return;
			}

			if (isNotificationDenied()) {
				if (detail?.showToast) {
					toast.error(
						"Notifications are blocked in your browser. Update your site settings to enable them.",
					);
				}
				return;
			}

			if (isRegistering) return;
			setRegistering(true);
			try {
				recordPrompt();
				const state = await Notification.requestPermission();
				await handlePermissionResult(state, detail);
			} catch (error) {
				console.error("Notification permission request failed", error);
				if (detail?.showToast) {
					toast.error(
						"We hit a snag enabling notifications. Please try again.",
					);
				}
			} finally {
				setRegistering(false);
			}
		},
		[
			handlePermissionResult,
			isRegistering,
			setRegistering,
			setSupported,
			recordPrompt,
		],
	);

	const unregister = useCallback(async () => {
		if (!isPushSupported()) {
			reset();
			return;
		}

		try {
			const registration = await ensureRegistration();
			const existing = await registration.pushManager.getSubscription();
			if (!existing) {
				reset();
				return;
			}
			await removeSubscription(existing.endpoint);
			await existing.unsubscribe();
			reset();
			toast.success("Push notifications disabled.");
		} catch (error) {
			console.error("Failed to unsubscribe from push notifications", error);
			toast.error("We couldn't disable notifications. Please try again later.");
		}
	}, [reset]);

	useEffect(() => {
		if (!initialized || !isPushSupported()) return;

		const handlePermissionEvent = (event: Event) => {
			requestPermission((event as PermissionRequestEvent).detail);
		};

		const handleUnregister = () => {
			void unregister();
		};

		window.addEventListener(
			"push:request-permission",
			handlePermissionEvent,
			false,
		);
		window.addEventListener("push:unsubscribe", handleUnregister, false);

		return () => {
			window.removeEventListener(
				"push:request-permission",
				handlePermissionEvent,
				false,
			);
			window.removeEventListener("push:unsubscribe", handleUnregister, false);
		};
	}, [initialized, requestPermission, unregister]);

	return {
		isSupported,
		permission,
		isRegistering,
		subscription,
		requestPermission,
		unregister,
	};
}
