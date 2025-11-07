import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

if (typeof global.ResizeObserver === "undefined") {
	type ObserverCallback = (
		entries: Array<ResizeObserverEntry>,
		observer: ResizeObserver,
	) => void;

	class MockResizeObserver {
		private readonly callback: ObserverCallback;

		constructor(callback: ObserverCallback) {
			this.callback = callback;
		}

		public observe(target?: Element) {
			const element = target as HTMLElement | undefined;
			const width =
				element?.clientWidth ??
				(Number.parseFloat(element?.style.width ?? "") || 800);
			const height =
				element?.clientHeight ??
				(Number.parseFloat(element?.style.height ?? "") || 400);

			this.callback(
				[
					{
						target: element as Element,
						contentRect: {
							x: 0,
							y: 0,
							width,
							height,
							top: 0,
							left: 0,
							right: width,
							bottom: height,
							toJSON() {
								return this;
							},
						} as DOMRectReadOnly,
					} as ResizeObserverEntry,
				],
				this as unknown as ResizeObserver,
			);
		}

		public unobserve() {}

		public disconnect() {}
	}

	// @ts-expect-error - assigning to global for test environment
	global.ResizeObserver = MockResizeObserver;
}

// Reset browser-like storage and timers between tests
beforeEach(() => {
	try {
		localStorage.clear();
	} catch {}
	try {
		sessionStorage.clear();
	} catch {}
	vi.clearAllMocks();
});

afterEach(() => {
	vi.useRealTimers();
});
