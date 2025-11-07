"use client";

import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useMemo } from "react";

interface Props {
	children: React.ReactNode;
}

export default function PostHogProviderBridge({ children }: Props) {
	const enable = process.env.NEXT_PUBLIC_ENABLE_POSTHOG === "true";
	const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
	const host =
		process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
	const debug = process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true";
	const capturePageview =
		(process.env.NEXT_PUBLIC_POSTHOG_CAPTURE_PAGEVIEW ?? "true") === "true";
	const sessionRecording =
		process.env.NEXT_PUBLIC_POSTHOG_SESSION_RECORDING === "true";

	// Initialize once when enabled and key present
	useEffect(() => {
		if (!enable || !key) return;
		posthog.init(key, {
			api_host: host,
			debug,
			autocapture: true,
			capture_pageview: capturePageview,
			capture_pageleave: true,
			session_recording: sessionRecording ? {} : undefined,
		});
		return () => {
			try {
				posthog.reset?.();
			} catch {}
		};
	}, [enable, key, host, debug, capturePageview, sessionRecording]);

	// Identify user via NextAuth session (email preferred)
	const { data } = useSession();
	useEffect(() => {
		if (!enable || !key) return;
		const email = data?.user?.email ?? undefined;
		const distinctId = email; // Prefer email as stable id in this app
		if (distinctId) {
			posthog?.identify?.(distinctId, {
				email,
				name: data?.user?.name,
			});
		}
	}, [data, enable, key]);

	const enabled = useMemo(() => enable && Boolean(key), [enable, key]);
	if (!enabled) return <>{children}</>;

	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
