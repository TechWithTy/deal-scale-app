"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInstallPrompt } from "@root/hooks/useInstallPrompt";
import { Button } from "@root/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@root/components/ui/card";

const WAITLIST_URL = "https://www.dealscale.io/auth?callback=/score-streak-flow";

const InstallPrompt = (): React.ReactElement | null => {
	const {
		canInstall,
		shouldShowBanner,
		isPrompting,
		isInstalled,
		isIosEligible,
		showInstallPrompt,
		dismissBanner,
		markEngagement,
	} = useInstallPrompt();

	const [sessionDismissed, setSessionDismissed] = useState(false);

	useEffect(() => {
		if (!shouldShowBanner) {
			return;
		}
		markEngagement();
	}, [shouldShowBanner, markEngagement]);

	const isBannerVisible = useMemo(() => {
		if (sessionDismissed) return false;
		if (isInstalled) return false;
		return shouldShowBanner;
	}, [isInstalled, sessionDismissed, shouldShowBanner]);

	const handleInstall = useCallback(async () => {
		const outcome = await showInstallPrompt();
		if (outcome !== "unavailable") {
			markEngagement();
		}
	}, [markEngagement, showInstallPrompt]);

	const handleDismiss = useCallback(() => {
		setSessionDismissed(true);
		dismissBanner();
	}, [dismissBanner]);

	const handleJoinWaitlist = useCallback(() => {
		markEngagement();
		window.location.assign(WAITLIST_URL);
	}, [markEngagement]);

	if (!isBannerVisible) {
		return null;
	}

	return (
		<div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
			<Card className="w-full max-w-xl border-primary/40 bg-background/95 backdrop-blur">
				<CardHeader className="pb-2">
					<CardTitle className="text-base font-semibold">
						Install Score Streak Flow for faster access
					</CardTitle>
					<CardDescription>
						Save the live leaderboard to your home screen and unlock offline
						insights.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					{isIosEligible ? (
						<ol className="list-decimal space-y-1 pl-5">
							<li>Tap the share button in Safari.</li>
							<li>Select “Add to Home Screen”.</li>
							<li>Confirm to install Score Streak Flow.</li>
						</ol>
					) : (
						<p>
							Install the app-like experience to keep player streak insights one
							tap away and receive timely push alerts.
						</p>
					)}
				</CardContent>
				<CardFooter className="flex flex-wrap gap-3">
					{isIosEligible ? (
						<Button variant="secondary" size="sm" onClick={handleDismiss}>
							Got it
						</Button>
					) : (
						<Button
							size="sm"
							disabled={!canInstall || isPrompting}
							onClick={handleInstall}
						>
							{isPrompting ? "Preparing…" : "Install now"}
						</Button>
					)}
					<Button variant="outline" size="sm" onClick={handleJoinWaitlist}>
						Join waitlist
					</Button>
					<Button variant="ghost" size="sm" onClick={handleDismiss}>
						Maybe later
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default InstallPrompt;

