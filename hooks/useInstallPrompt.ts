"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	hasServiceWorkerSupport,
	isClient,
	isIosDevice,
	isStandaloneMode,
} from "@/lib/utils/pwa";

const VISIT_COUNT_KEY = "dealscale:pwa:visit-count";
const DISMISS_KEY = "dealscale:pwa:install-dismissed";
const ENGAGEMENT_KEY = "dealscale:pwa:engaged";

type InstallOutcome = "accepted" | "dismissed" | "unavailable";

interface InstallPromptState {
	canInstall: boolean;
	shouldShowBanner: boolean;
	isPrompting: boolean;
	isInstalled: boolean;
	isIosEligible: boolean;
	visitCount: number;
	showInstallPrompt: () => Promise<InstallOutcome>;
	dismissBanner: () => void;
	markEngagement: () => void;
}

export function useInstallPrompt(): InstallPromptState {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [visitCount, setVisitCount] = useState(0);
	const [isEngaged, setIsEngaged] = useState(false);
	const [isInstalled, setIsInstalled] = useState(() =>
		isClient() ? isStandaloneMode() : false,
	);
	const [dismissed, setDismissed] = useState(() =>
		isClient() ? localStorage.getItem(DISMISS_KEY) === "true" : false,
	);
	const [isPrompting, setIsPrompting] = useState(false);
	const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

	useEffect(() => {
		if (!isClient()) return;
		const storedVisits = Number(localStorage.getItem(VISIT_COUNT_KEY) ?? "0");
		const storedEngagement = localStorage.getItem(ENGAGEMENT_KEY) === "true";
		setVisitCount(storedVisits);
		setIsEngaged(storedEngagement);

		const updatedVisits = storedVisits + 1;
		localStorage.setItem(VISIT_COUNT_KEY, String(updatedVisits));
		setVisitCount(updatedVisits);
	}, []);

	useEffect(() => {
		if (!isClient()) return;
		function onBeforeInstallPrompt(event: BeforeInstallPromptEvent) {
			event.preventDefault();
			promptRef.current = event;
			setDeferredPrompt(event);
		}

		function onAppInstalled() {
			setIsInstalled(true);
			setDeferredPrompt(null);
			promptRef.current = null;
			localStorage.setItem(DISMISS_KEY, "true");
		}

		window.addEventListener(
			"beforeinstallprompt",
			onBeforeInstallPrompt as EventListener,
		);
		window.addEventListener("appinstalled", onAppInstalled);
		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				onBeforeInstallPrompt as EventListener,
			);
			window.removeEventListener("appinstalled", onAppInstalled);
		};
	}, []);

	const dismissBanner = useCallback(() => {
		setDismissed(true);
		if (isClient()) {
			localStorage.setItem(DISMISS_KEY, "true");
		}
	}, []);

	const markEngagement = useCallback(() => {
		setIsEngaged(true);
		if (isClient()) {
			localStorage.setItem(ENGAGEMENT_KEY, "true");
		}
	}, []);

	const showInstallPrompt = useCallback(async () => {
		const prompt = promptRef.current ?? deferredPrompt;
		if (!prompt) {
			return "unavailable";
		}
		setIsPrompting(true);
		try {
			prompt.prompt();
			const choiceResult = await prompt.userChoice;
			if (choiceResult.outcome === "accepted") {
				setIsInstalled(true);
				localStorage.setItem(DISMISS_KEY, "true");
			}
			promptRef.current = null;
			setDeferredPrompt(null);
			return choiceResult.outcome;
		} finally {
			setIsPrompting(false);
		}
	}, [deferredPrompt]);

	const hasMetVisitRequirement = visitCount >= 3 || isEngaged;
	const canInstall = Boolean(deferredPrompt);
	const isIosEligible = isIosDevice() && !isStandaloneMode();
	const shouldShowBanner = useMemo(() => {
		if (dismissed || isInstalled) return false;
		if (isIosEligible) return true;
		if (!hasServiceWorkerSupport()) return false;
		return canInstall && hasMetVisitRequirement;
	}, [
		canInstall,
		dismissed,
		hasMetVisitRequirement,
		isInstalled,
		isIosEligible,
	]);

	return {
		canInstall,
		shouldShowBanner,
		isPrompting,
		isInstalled,
		isIosEligible,
		visitCount,
		showInstallPrompt,
		dismissBanner,
		markEngagement,
	};
}
