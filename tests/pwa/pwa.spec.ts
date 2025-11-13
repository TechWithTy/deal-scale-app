import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { usePushStore } from "@/lib/stores/pushStore";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import * as pwaUtils from "@/lib/utils/pwa";

const VISIT_COUNT_KEY = "dealscale:pwa:visit-count";
const PROBE_INTERVAL = 15_000;

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

	it("suppresses banner when the user previously dismissed it", async () => {
		localStorage.setItem("dealscale:pwa:install-dismissed", "true");
		stubServiceWorkerSupport();
		const { result } = renderHook(() => useInstallPrompt());

		await act(async () => Promise.resolve());

		expect(result.current.shouldShowBanner).toBe(false);
	});

	it("surfaces banner after engagement even below visit threshold", async () => {
		localStorage.setItem(VISIT_COUNT_KEY, "0");
		stubServiceWorkerSupport();
		const mockPrompt = vi.fn(() => Promise.resolve());
		const userChoice = Promise.resolve({ outcome: "dismissed", platform: "web" });
		const event = createBeforeInstallPromptEvent({ mockPrompt, userChoice });

		const { result } = renderHook(() => useInstallPrompt());

		await act(async () => Promise.resolve());
		act(() => {
			result.current.markEngagement();
		});
		await act(async () => {
			window.dispatchEvent(event);
			await Promise.resolve();
		});

		expect(result.current.shouldShowBanner).toBe(true);
		expect(result.current.canInstall).toBe(true);
	});

	it("shows iOS banner even when service worker install prompt is unavailable", async () => {
		const swSupport = vi
			.spyOn(pwaUtils, "hasServiceWorkerSupport")
			.mockReturnValue(false);
		const iosSpy = vi.spyOn(pwaUtils, "isIosDevice").mockReturnValue(true);
		const standaloneSpy = vi
			.spyOn(pwaUtils, "isStandaloneMode")
			.mockReturnValue(false);

		const { result } = renderHook(() => useInstallPrompt());

		await act(async () => Promise.resolve());

		expect(result.current.isIosEligible).toBe(true);
		expect(result.current.shouldShowBanner).toBe(true);
		expect(result.current.canInstall).toBe(false);

		swSupport.mockRestore();
		iosSpy.mockRestore();
		standaloneSpy.mockRestore();
	});

	it("marks state installed when appinstalled event fires", async () => {
		stubServiceWorkerSupport();
		const { result } = renderHook(() => useInstallPrompt());

		await act(async () => Promise.resolve());
		await act(async () => {
			window.dispatchEvent(new Event("appinstalled"));
		});

		expect(result.current.isInstalled).toBe(true);
		expect(localStorage.getItem("dealscale:pwa:install-dismissed")).toBe("true");
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

describe("useOnlineStatus hook", () => {
	const originalFetch = globalThis.fetch;
	const originalOnlineDescriptor = Object.getOwnPropertyDescriptor(
		window.navigator,
		"onLine",
	);
	type FetchMock = ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.useFakeTimers();
		setNavigatorOnline(true);
		globalThis.fetch = vi
			.fn(async (...args: Parameters<typeof fetch>) => {
				return await originalFetch(...args);
			}) as unknown as typeof fetch;
	});

	afterEach(() => {
		vi.useRealTimers();
		globalThis.fetch = originalFetch;
		if (originalOnlineDescriptor) {
			Object.defineProperty(window.navigator, "onLine", originalOnlineDescriptor);
		}
	});

	it("recovers to online when navigator.onLine is false but probe succeeds", async () => {
		setNavigatorOnline(false);
		(globalThis.fetch as unknown as FetchMock).mockResolvedValue(
			{ ok: true } as Response,
		);

		const { result } = renderHook(() => useOnlineStatus());

		expect(result.current.isOnline).toBe(false);

		await act(async () => {
			// Allow the probe effect to start.
			await Promise.resolve();
		});

		await act(async () => {
			vi.runOnlyPendingTimers();
		});

		expect(result.current.isOnline).toBe(true);
		expect(result.current.lastChangedAt).toBeTypeOf("number");
	});

	it("stays offline when probe fails", async () => {
		setNavigatorOnline(false);
		(globalThis.fetch as unknown as FetchMock).mockRejectedValue(
			new Error("network error"),
		);

		const { result } = renderHook(() => useOnlineStatus());

		await act(async () => {
			await Promise.resolve();
		});

		await act(async () => {
			vi.advanceTimersByTime(30_000);
		});

		expect(result.current.isOnline).toBe(false);
	});

	it("debounces multiple probes by avoiding duplicate fetches during the same interval", async () => {
		setNavigatorOnline(false);
		const mockFetch = vi.fn().mockRejectedValue(new Error("still offline"));
		globalThis.fetch = mockFetch as unknown as typeof fetch;

		renderHook(() => useOnlineStatus());

		await act(async () => {
			await Promise.resolve();
		});

		await act(async () => {
			vi.advanceTimersByTime(PROBE_INTERVAL);
		});

		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	it("stops probing and resets once navigation online event fires", async () => {
		setNavigatorOnline(false);
		const mockFetch = vi.fn().mockResolvedValue({ ok: false } as Response);
		globalThis.fetch = mockFetch as unknown as typeof fetch;

		const { result } = renderHook(() => useOnlineStatus());

		await act(async () => Promise.resolve());
		await act(async () => {
			window.dispatchEvent(new Event("online"));
		});
		expect(result.current.isOnline).toBe(true);

		const callCountAfterOnline = mockFetch.mock.calls.length;
		await act(async () => {
			vi.advanceTimersByTime(60_000);
		});

		expect(mockFetch).toHaveBeenCalledTimes(callCountAfterOnline);
	});

	it("respects AbortController when component unmounts mid-probe", async () => {
		setNavigatorOnline(false);
		const abortableFetch = vi
			.fn()
			.mockImplementation(
				(_: RequestInfo | URL, init?: RequestInit) =>
					new Promise<Response>((resolve, reject) => {
						init?.signal?.addEventListener("abort", () =>
							reject(new DOMException("Aborted", "AbortError")),
						);
					}),
			);

		globalThis.fetch = abortableFetch as unknown as typeof fetch;

		const { unmount } = renderHook(() => useOnlineStatus());

		await act(async () => Promise.resolve());
		unmount();

		expect(abortableFetch).toHaveBeenCalledTimes(1);
		expect(abortableFetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
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

function setNavigatorOnline(value: boolean) {
	Object.defineProperty(window.navigator, "onLine", {
		value,
		configurable: true,
	});
}
