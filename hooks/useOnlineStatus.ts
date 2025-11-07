"use client";

import { useEffect, useState } from "react";

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

	return state;
}
