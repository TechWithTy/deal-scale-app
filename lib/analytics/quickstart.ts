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

type QuickStartAnalyticsEvent =
	| "quickstart_persona_selected"
	| "quickstart_goal_selected"
	| "quickstart_wizard_cancelled"
	| "quickstart_plan_completed";

type QuickStartAnalyticsPayload = Record<string, unknown>;

export const captureQuickStartEvent = (
	event: QuickStartAnalyticsEvent,
	payload: QuickStartAnalyticsPayload,
) => {
	const targets = getCaptureTarget();
	if (!targets) {
		return;
	}

	const enablePosthog = process?.env?.NEXT_PUBLIC_ENABLE_POSTHOG === "true";
	const enableClarity = process?.env?.NEXT_PUBLIC_ENABLE_CLARITY === "true";

	const enrichedPayload = {
		feature: "quickstart",
		...payload,
	} satisfies QuickStartAnalyticsPayload;

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
