"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { X } from "lucide-react";

const DISMISS_STORAGE_KEY = "offline-banner-dismissed";
const DISMISS_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function OfflineBanner(): React.ReactElement | null {
	const { isOnline, lastChangedAt } = useOnlineStatus();
	const [dismissed, setDismissed] = useState(true); // Start optimistic

	// Check if banner was recently dismissed
	useEffect(() => {
		if (typeof window === "undefined") return;

		const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
		if (dismissedUntil) {
			const until = Number.parseInt(dismissedUntil, 10);
			if (Date.now() < until) {
				setDismissed(true);
				return;
			}
		}
		setDismissed(false);
	}, []);

	// Reset dismiss state when coming back online
	useEffect(() => {
		if (isOnline && typeof window !== "undefined") {
			localStorage.removeItem(DISMISS_STORAGE_KEY);
			setDismissed(false);
		}
	}, [isOnline]);

	const handleDismiss = useCallback(() => {
		const dismissUntil = Date.now() + DISMISS_DURATION_MS;
		localStorage.setItem(DISMISS_STORAGE_KEY, dismissUntil.toString());
		setDismissed(true);
	}, []);

	// Don't render if online or dismissed
	if (isOnline || dismissed) {
		return null;
	}

	return (
		<div
			className="pointer-events-none fixed top-0 z-[9999] w-full"
			role="alert"
			aria-live="polite"
		>
			<div className="pointer-events-auto m-3">
				<Alert
					variant="destructive"
					className="relative flex flex-col gap-3 border-2 shadow-lg sm:flex-row sm:items-center sm:justify-between"
				>
					<div className="flex-1 pr-8">
						<AlertTitle className="mb-1 font-semibold">
							You&apos;re offline
						</AlertTitle>
						<AlertDescription className="text-sm">
							Stop guessing. QuickStart handles the busywork for you.
							<br />
							We&apos;ll keep your campaign drafts and analytics cached. Changes
							will sync once you reconnect.
							{lastChangedAt && (
								<span className="ml-1 text-xs opacity-75">
									Lost connection {formatRelativeTime(lastChangedAt)} ago.
								</span>
							)}
						</AlertDescription>
					</div>
					<Button
						onClick={handleDismiss}
						size="sm"
						variant="secondary"
						className="pointer-events-auto shrink-0 bg-white/90 text-black hover:bg-white"
						aria-label="Dismiss offline notification"
					>
						Dismiss
					</Button>
					<button
						type="button"
						onClick={handleDismiss}
						className="pointer-events-auto absolute top-2 right-2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:hidden"
						aria-label="Close"
					>
						<X className="h-4 w-4" />
					</button>
				</Alert>
			</div>
		</div>
	);
}

function formatRelativeTime(timestamp: number): string {
	const delta = Date.now() - timestamp;
	if (Number.isNaN(delta) || delta < 0) return "just now";
	const seconds = Math.round(delta / 1000);
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.round(minutes / 60);
	return `${hours}h`;
}

export default OfflineBanner;
