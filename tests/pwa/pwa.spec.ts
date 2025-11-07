import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { usePushStore } from "@/lib/stores/pushStore";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

const VISIT_COUNT_KEY = "dealscale:pwa:visit-count";

beforeEach(() => {
	localStorage.clear();
	usePushStore.getState().reset();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("PWA push store", () => {
	it("captures subscription metadata and timestamps", () => {
		const subscription = {
			endpoint: "https://example.com/push/123",
			expirationTime: null,
			keys: { auth: "auth-token", p256dh: "p256dh-key" },
		} satisfies PushSubscriptionJSON;

		usePushStore.getState().setSubscription(subscription);
		const state = usePushStore.getState();
		expect(state.subscription?.endpoint).toBe(subscription.endpoint);
		expect(state.lastUpdatedAt).toBeTypeOf("number");
	});

	it("tracks permission changes", () => {
		const store = usePushStore.getState();
		store.setPermission("granted");
		store.setSupported(true);
		const { permission, isSupported } = usePushStore.getState();
		expect(permission).toBe("granted");
		expect(isSupported).toBe(true);
	});
});

describe("PWA install prompt hook", () => {
	it("exposes install prompt workflow after beforeinstallprompt", async () => {
		localStorage.setItem(VISIT_COUNT_KEY, "2");
		stubServiceWorkerSupport();
		const mockPrompt = vi.fn(() => Promise.resolve());
		const userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });
		const event = createBeforeInstallPromptEvent({ mockPrompt, userChoice });

		const { result } = renderHook(() => useInstallPrompt());

		await act(async () => {
			window.dispatchEvent(event);
			await Promise.resolve();
		});

		expect(result.current.canInstall).toBe(true);
		expect(result.current.shouldShowBanner).toBe(true);

		await act(async () => {
			const outcome = await result.current.showInstallPrompt();
			expect(outcome).toBe("accepted");
		});

		expect(mockPrompt).toHaveBeenCalledTimes(1);
	});
});

describe("Service worker update hook", () => {
	it("detects waiting worker and posts skip-waiting message", async () => {
		const postMessage = vi.fn();
		mockServiceWorkerEnvironment({ postMessage });

		const { result } = renderHook(() => useServiceWorkerUpdate());

		await act(async () => {
			await Promise.resolve();
		});

		expect(result.current.hasUpdate).toBe(true);

		await act(async () => {
			result.current.applyUpdate();
		});

		expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
	});
});

interface BeforeInstallPromptOptions {
	mockPrompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function createBeforeInstallPromptEvent({
	mockPrompt,
	userChoice,
}: BeforeInstallPromptOptions) {
	const event = new Event("beforeinstallprompt") as BeforeInstallPromptEvent & {
		readonly platforms: string[];
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
	};
	Object.defineProperties(event, {
		platforms: { value: ["web"], writable: false },
		prompt: { value: vi.fn(mockPrompt), writable: false },
		userChoice: { value: userChoice, writable: false },
	});
	return event;
}

function mockServiceWorkerEnvironment({
	postMessage,
}: {
	postMessage: (message: unknown) => void;
}) {
	stubServiceWorkerSupport({
		controller: {} as ServiceWorker,
		getRegistration: vi.fn().mockResolvedValue({
			waiting: {
				postMessage,
				scriptURL: "https://example.com/sw.js",
			} as unknown as ServiceWorker,
			addEventListener: vi.fn(),
		} as unknown as ServiceWorkerRegistration),
	});

	stubLocationReload();
}

function stubServiceWorkerSupport(
	overrides?: Partial<ServiceWorkerContainer> & { controller?: ServiceWorker },
) {
	const baseRegistration = {
		waiting: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		navigationPreload: { enable: vi.fn() },
	} as unknown as ServiceWorkerRegistration;

	Object.defineProperty(globalThis.navigator, "serviceWorker", {
		value: {
			controller: overrides?.controller ?? null,
			getRegistration: overrides?.getRegistration ??
				vi.fn().mockResolvedValue(baseRegistration),
			addEventListener: overrides?.addEventListener ?? vi.fn(),
			removeEventListener: overrides?.removeEventListener ?? vi.fn(),
		} satisfies ServiceWorkerContainer,
		configurable: true,
	});
}

function stubLocationReload() {
	const original = window.location;
	const reload = vi.fn();
	Object.defineProperty(window, "location", {
		value: { ...original, reload },
		configurable: true,
	});
}
