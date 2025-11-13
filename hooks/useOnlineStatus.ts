"use client";

import { useEffect, useState } from "react";

const ONLINE_PROBE_INTERVAL_MS = 15_000;
const ONLINE_PROBE_URL = "/api/health";

interface OnlineStatus {
	isOnline: boolean;
	lastChangedAt: number | null;
}

export function useOnlineStatus(): OnlineStatus {
	const [state, setState] = useState<OnlineStatus>(() => ({
		isOnline: typeof navigator === "undefined" ? true : navigator.onLine,
		lastChangedAt: null,
	}));

	useEffect(() => {
		function handleChange(nextStatus: boolean) {
			setState({ isOnline: nextStatus, lastChangedAt: Date.now() });
		}
		const onOnline = () => handleChange(true);
		const onOffline = () => handleChange(false);
		window.addEventListener("online", onOnline);
		window.addEventListener("offline", onOffline);
		return () => {
			window.removeEventListener("online", onOnline);
			window.removeEventListener("offline", onOffline);
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || state.isOnline) {
			return;
		}

		let cancelled = false;
		let intervalId: number | null = null;
		let activeController: AbortController | null = null;

		const markOnline = () => {
			setState((prev) =>
				prev.isOnline ? prev : { isOnline: true, lastChangedAt: Date.now() },
			);
		};

		const probeConnectivity = async () => {
			if (cancelled) return;

			// Browser might have stale offline flag; bail early if it reports online again.
			if (navigator.onLine) {
				markOnline();
				return;
			}

			if (typeof fetch !== "function") {
				return;
			}

			try {
				const controller = new AbortController();
				activeController = controller;
				const response = await fetch(ONLINE_PROBE_URL, {
					method: "HEAD",
					cache: "no-store",
					credentials: "same-origin",
					signal: controller.signal,
				});
				if (cancelled) {
					return;
				}
				if (response.ok) {
					markOnline();
				}
			} catch {
				// Silently ignore network errors; we'll retry on the next interval.
			}
		};

		void probeConnectivity();
		intervalId = window.setInterval(
			probeConnectivity,
			ONLINE_PROBE_INTERVAL_MS,
		);

		return () => {
			cancelled = true;
			if (intervalId !== null) {
				window.clearInterval(intervalId);
			}
			activeController?.abort();
		};
	}, [state.isOnline]);

	return state;
}
