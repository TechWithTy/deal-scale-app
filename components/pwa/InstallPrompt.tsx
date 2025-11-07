"use client";

import { useCallback, useEffect, useState } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const DISMISS_EVENT = "pwa:install:dismiss";
const ENGAGEMENT_EVENT = "pwa:engagement";

export function InstallPrompt(): React.ReactElement | null {
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
	const [hasDismissedSession, setHasDismissedSession] = useState(false);

	useEffect(() => {
		function onDismiss() {
			setHasDismissedSession(true);
			dismissBanner();
		}
		function onEngagement() {
			markEngagement();
		}
		window.addEventListener(DISMISS_EVENT, onDismiss);
		window.addEventListener(ENGAGEMENT_EVENT, onEngagement);
		return () => {
			window.removeEventListener(DISMISS_EVENT, onDismiss);
			window.removeEventListener(ENGAGEMENT_EVENT, onEngagement);
		};
	}, [dismissBanner, markEngagement]);

	const handleInstall = useCallback(async () => {
		const outcome = await showInstallPrompt();
		if (outcome === "accepted") {
			toast.success(
				"Deal Scale is installing. Look for it on your home screen.",
			);
		} else if (outcome === "dismissed") {
			toast.message(
				"No worries. You can install Deal Scale later from settings.",
			);
		}
	}, [showInstallPrompt]);

	const handleDismiss = useCallback(() => {
		setHasDismissedSession(true);
		dismissBanner();
	}, [dismissBanner]);

	if (isInstalled || hasDismissedSession || !shouldShowBanner) {
		return null;
	}

	return (
		<div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
			<Card className="w-full max-w-xl border-primary/40 bg-background/95 backdrop-blur">
				<CardHeader className="pb-2">
					<CardTitle className="text-base font-semibold">
						Install Deal Scale for faster access
					</CardTitle>
					<CardDescription>
						Get offline-ready dashboards, instant launch, and home screen
						access.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					{isIosEligible ? (
						<ol className="list-decimal space-y-1 pl-5">
							<li>Tap the share icon in Safari.</li>
							<li>Select "Add to Home Screen".</li>
							<li>Confirm to install Deal Scale.</li>
						</ol>
					) : (
						<p>
							A quick install keeps your leads one tap away and enables push
							alerts even when your browser is closed.
						</p>
					)}
				</CardContent>
				<CardFooter className="gap-3">
					{isIosEligible ? (
						<Button variant="secondary" size="sm" onClick={handleDismiss}>
							Got it
						</Button>
					) : (
						<Button
							disabled={!canInstall || isPrompting}
							onClick={handleInstall}
							size="sm"
						>
							{isPrompting ? "Preparing…" : "Install now"}
						</Button>
					)}
					<Button variant="ghost" size="sm" onClick={handleDismiss}>
						Maybe later
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

export default InstallPrompt;
