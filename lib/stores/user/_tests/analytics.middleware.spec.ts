import { beforeEach, describe, expect, it, vi } from "vitest";
import { create } from "zustand";
import { withAnalytics } from "../../_middleware/analytics";

interface TestState {
	count: number;
	nested: { a: number };
	inc: () => void;
	setCount: (n: number) => void;
}

type CaptureProps = {
	store?: string;
	keys?: string[];
	count?: number;
} & Record<string, unknown>;

function makeStore() {
	return create<TestState>(
		withAnalytics<TestState>("test_store", (set, get) => ({
			count: 0,
			nested: { a: 1 },
			inc: () => set((s) => ({ count: s.count + 1 })),
			setCount: (n) => set({ count: n }),
		})),
	);
}

describe("withAnalytics middleware", () => {
	beforeEach(() => {
		// reset env toggles between tests
		process.env.NEXT_PUBLIC_ENABLE_POSTHOG = "false";
		process.env.NEXT_PUBLIC_ENABLE_CLARITY = "false";
		// reset SDKs
		window.posthog = undefined;
		window.clarity = undefined;
	});

	it("no-ops when analytics flags are disabled", () => {
		const capture = vi.fn();
		const clarityEv = vi.fn();
		// SDKs present but flags disabled
		window.posthog = { capture } as Window["posthog"];
		const clarityFn: NonNullable<Window["clarity"]> = (type, name, props) => {
			clarityEv(type, name, props);
		};
		window.clarity = clarityFn;

		const store = makeStore();
		store.getState().inc();

		expect(capture).not.toHaveBeenCalled();
		expect(clarityEv).not.toHaveBeenCalled();
	});

	it("captures PostHog with diff keys on set() when enabled", () => {
		const capture = vi.fn();
		window.posthog = { capture } as Window["posthog"];
		process.env.NEXT_PUBLIC_ENABLE_POSTHOG = "true";

		const store = makeStore();
		store.getState().setCount(5);

		expect(capture).toHaveBeenCalledTimes(1);
		const [event, props] = capture.mock.calls[0];
		expect(event).toBe("zustand_set");
		expect(props).toMatchObject({ store: "test_store" });
		// keys should include count when it changes
		const keys = (props as CaptureProps).keys ?? [];
		expect(Array.isArray(keys)).toBe(true);
		expect(keys).toContain("count");
	});

	it("captures Clarity with diff keys on set() when enabled", () => {
		const clarityEv = vi.fn();
		const clarityFn: NonNullable<Window["clarity"]> = (type, name, props) => {
			clarityEv(type, name, props);
		};
		window.clarity = clarityFn;
		process.env.NEXT_PUBLIC_ENABLE_CLARITY = "true";

		const store = makeStore();
		store.getState().inc();

		expect(clarityEv).toHaveBeenCalledTimes(1);
		const [type, name, props] = clarityEv.mock.calls[0];
		expect(type).toBe("event");
		expect(name).toBe("zustand_set");
		expect(props).toMatchObject({ store: "test_store" });
		const keys = (props as CaptureProps).keys ?? [];
		expect(keys).toContain("count");
	});
});
