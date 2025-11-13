const isBrowser = () => typeof window !== "undefined";

type CaptureTarget = {
	readonly posthog?: {
		capture?: (event: string, payload?: Record<string, unknown>) => void;
	};
	readonly clarity?: (
		type: "event",
		name: string,
		properties?: Record<string, unknown>,
	) => void;
};

const getCaptureTarget = (): CaptureTarget | null => {
	if (!isBrowser()) {
		return null;
	}

	return {
		posthog: window.posthog,
		clarity: typeof window.clarity === "function" ? window.clarity : undefined,
	};
};

type DemoAnalyticsEvent = "demo_reveal_viewed";

type DemoAnalyticsPayload = Record<string, unknown>;

export const captureDemoEvent = (
	event: DemoAnalyticsEvent,
	payload: DemoAnalyticsPayload,
) => {
	const targets = getCaptureTarget();
	if (!targets) {
		return;
	}

	const enablePosthog = process?.env?.NEXT_PUBLIC_ENABLE_POSTHOG === "true";
	const enableClarity = process?.env?.NEXT_PUBLIC_ENABLE_CLARITY === "true";

	const enrichedPayload = {
		feature: "demo",
		...payload,
	} satisfies DemoAnalyticsPayload;

	try {
		if (enablePosthog) {
			targets.posthog?.capture?.(event, enrichedPayload);
		}
		if (enableClarity) {
			targets.clarity?.("event", event, enrichedPayload);
		}
	} catch {
		// Ignore analytics failures to avoid blocking UI flows.
	}
};
