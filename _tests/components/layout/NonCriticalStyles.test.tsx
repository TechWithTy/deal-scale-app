import { NonCriticalStyles } from "@/components/layout/NonCriticalStyles";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type IdleRequestCallback = (deadline: {
	didTimeout: boolean;
	timeRemaining: () => number;
}) => void;

declare global {
	interface Window {
		requestIdleCallback?: (callback: IdleRequestCallback) => number;
		cancelIdleCallback?: (handle: number) => void;
	}
}

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("NonCriticalStyles", () => {
	beforeEach(() => {
		document.head.innerHTML = "";
		document.body.innerHTML = "";
	});

	afterEach(() => {
		vi.useRealTimers();
		window.requestIdleCallback = undefined;
		window.cancelIdleCallback = undefined;
	});

	it("injects the deferred stylesheet after the idle callback runs", () => {
		const callbacks: IdleRequestCallback[] = [];
		window.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
			callbacks.push(callback);
			return callbacks.length;
		});
		window.cancelIdleCallback = vi.fn();

		const container = document.createElement("div");
		const root = createRoot(container);

		act(() => {
			root.render(<NonCriticalStyles />);
		});

		expect(window.requestIdleCallback).toHaveBeenCalledTimes(1);
		expect(
			document.head.querySelector("link#deal-scale-non-critical-css"),
		).toBeNull();

		for (const callback of callbacks) {
			act(() => {
				callback({ didTimeout: false, timeRemaining: () => 5 });
			});
		}

		const stylesheet = document.head.querySelector<HTMLLinkElement>(
			"link#deal-scale-non-critical-css",
		);
		expect(stylesheet).not.toBeNull();

		stylesheet?.dispatchEvent(new Event("load"));
		expect(stylesheet?.media).toBe("all");

		act(() => {
			root.unmount();
		});
	});

	it("falls back to a timeout when requestIdleCallback is unavailable", () => {
		vi.useFakeTimers();
		const container = document.createElement("div");
		const root = createRoot(container);

		act(() => {
			root.render(<NonCriticalStyles />);
		});

		expect(
			document.head.querySelector("link#deal-scale-non-critical-css"),
		).toBeNull();

		act(() => {
			vi.runAllTimers();
		});

		const stylesheet = document.head.querySelector(
			"link#deal-scale-non-critical-css",
		);
		expect(stylesheet).not.toBeNull();

		act(() => {
			root.unmount();
		});
	});

	it("does not duplicate the stylesheet on re-renders", () => {
		const callbacks: IdleRequestCallback[] = [];
		window.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
			callbacks.push(callback);
			return callbacks.length;
		});

		const container = document.createElement("div");
		const root = createRoot(container);

		act(() => {
			root.render(<NonCriticalStyles />);
		});

		for (const callback of callbacks) {
			act(() => {
				callback({ didTimeout: false, timeRemaining: () => 5 });
			});
		}

		const stylesheet = document.head.querySelector(
			"link#deal-scale-non-critical-css",
		);
		expect(stylesheet).not.toBeNull();

		act(() => {
			root.render(<NonCriticalStyles />);
		});

		for (const callback of callbacks) {
			act(() => {
				callback({ didTimeout: false, timeRemaining: () => 5 });
			});
		}

		const stylesheets = document.head.querySelectorAll(
			"link#deal-scale-non-critical-css",
		);
		expect(stylesheets.length).toBe(1);

		act(() => {
			root.unmount();
		});
	});
});
