import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import type { ToastActionElement } from "@root/components/ui/toast";
import { toast } from "../hooks/use-toast";

const createReloadAction = (
	updateServiceWorker: (reloadPage?: boolean) => Promise<void>,
): ToastActionElement => ({
	label: "Reload",
	onClick: () => {
		void updateServiceWorker(true);
	},
});

const ServiceWorkerToasts = () => {
	const dismissRef = useRef<(() => void) | null>(null);

	const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
		immediate: false,
		onRegistered: (registration) => {
			if (registration) {
				console.info("[PWA] service worker registered", registration.scope);
			}
		},
		onRegisterError: (error) => {
			console.error("[PWA] service worker registration failed", error);
			dismissRef.current = toast({
				variant: "destructive",
				title: "PWA update failed",
				description: "Unable to register the offline worker.",
			}).dismiss;
		},
	});

	useEffect(() => {
		if (!offlineReady) {
			return;
		}

		dismissRef.current?.();

		const { dismiss } = toast({
			title: "Offline ready",
			description: "Score Streak Flow is cached for offline use.",
		});

		dismissRef.current = dismiss;
	}, [offlineReady]);

	useEffect(() => {
		if (!needRefresh) {
			return;
		}

		dismissRef.current?.();

		const { dismiss } = toast({
			title: "Update available",
			description: "Reload to apply the latest dashboard experience.",
			action: createReloadAction(updateServiceWorker),
		});

		dismissRef.current = dismiss;
	}, [needRefresh, updateServiceWorker]);

	return null;
};

export default ServiceWorkerToasts;

