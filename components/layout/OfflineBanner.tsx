"use client";

import { useCallback, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner(): React.ReactElement | null {
	const { isOnline, lastChangedAt } = useOnlineStatus();
	const [dismissed, setDismissed] = useState(false);

	const handleDismiss = useCallback(() => {
		setDismissed(true);
	}, []);

	if (isOnline || dismissed) {
		return null;
	}

	return (
		<div className="sticky top-0 z-50 w-full px-3 pb-3">
			<Alert
				variant="destructive"
				className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
			>
				<div>
					<AlertTitle>You&apos;re offline</AlertTitle>
					<AlertDescription>
						We&apos;ll keep your campaign drafts and analytics cached. Changes
						will sync once you reconnect.
						{lastChangedAt ? (
							<span className="ml-1 text-xs text-muted-foreground">
								Lost connection {formatRelativeTime(lastChangedAt)} ago.
							</span>
						) : null}
					</AlertDescription>
				</div>
				<Button onClick={handleDismiss} size="sm" variant="outline">
					Dismiss
				</Button>
			</Alert>
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
