"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface ServiceWorkerUpdateState {
	hasUpdate: boolean;
	isReloading: boolean;
	applyUpdate: () => void;
	dismissUpdate: () => void;
}

export function useServiceWorkerUpdate(): ServiceWorkerUpdateState {
	const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
		null,
	);
	const [isReloading, setIsReloading] = useState(false);
	const ignoredScriptRef = useRef<string | null>(null);
	const hasReloaded = useRef(false);

	useEffect(() => {
		if (!("serviceWorker" in navigator)) return;
		let cancelled = false;

		function subscribeToRegistration(registration: ServiceWorkerRegistration) {
			if (registration.waiting) {
				setWaitingWorker(registration.waiting);
			}
			registration.addEventListener("updatefound", () => {
				const newWorker = registration.installing;
				if (!newWorker) return;
				newWorker.addEventListener("statechange", () => {
					if (
						newWorker.state === "installed" &&
						navigator.serviceWorker.controller
					) {
						setWaitingWorker(newWorker);
					}
				});
			});
		}

		navigator.serviceWorker.getRegistration().then((registration) => {
			if (!registration || cancelled) return;
			subscribeToRegistration(registration);
		});

		function onControllerChange() {
			if (hasReloaded.current) return;
			hasReloaded.current = true;
			window.location.reload();
		}

		navigator.serviceWorker.addEventListener(
			"controllerchange",
			onControllerChange,
		);

		return () => {
			cancelled = true;
			navigator.serviceWorker.removeEventListener(
				"controllerchange",
				onControllerChange,
			);
		};
	}, []);

	const applyUpdate = useCallback(() => {
		if (!waitingWorker) return;
		setIsReloading(true);
		waitingWorker.postMessage({ type: "SKIP_WAITING" });
	}, [waitingWorker]);

	const dismissUpdate = useCallback(() => {
		if (waitingWorker?.scriptURL) {
			ignoredScriptRef.current = waitingWorker.scriptURL;
		}
		setWaitingWorker(null);
	}, [waitingWorker]);

	const hasUpdate = useMemo(() => {
		if (!waitingWorker) return false;
		if (ignoredScriptRef.current === waitingWorker.scriptURL) return false;
		return true;
	}, [waitingWorker]);

	return {
		hasUpdate,
		isReloading,
		applyUpdate,
		dismissUpdate,
	};
}
