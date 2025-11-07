import { render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const COMPLETE_DELAY_MS = 250;
const TICK_INTERVAL_MS = 200;

const useIsFetchingMock = vi.fn(() => 0);
const useIsMutatingMock = vi.fn(() => 0);

vi.mock("@tanstack/react-query", async () => {
	const actual = await vi.importActual<
		typeof import("@tanstack/react-query")
	>("@tanstack/react-query");
	return {
		...actual,
		useIsFetching: () => useIsFetchingMock(),
		useIsMutating: () => useIsMutatingMock(),
	};
});

vi.mock("@/components/ui/scroll-progress", () => {
	return {
		ScrollProgress: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function MockScrollProgress(
			props,
			ref,
		) {
			return <div ref={ref} data-testid="global-load-progress" {...props} />;
		}),
	};
});

async function loadComponent() {
	return (await import("@/components/layout/GlobalLoadProgress")).default;
}

describe("GlobalLoadProgress", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		useIsFetchingMock.mockReturnValue(0);
		useIsMutatingMock.mockReturnValue(0);
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
	vi.clearAllTimers();
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("renders in the idle state by default", async () => {
		const GlobalLoadProgress = await loadComponent();
		render(<GlobalLoadProgress />);
		vi.advanceTimersByTime(COMPLETE_DELAY_MS + 10);
		const progress = screen.getByTestId("global-load-progress");
		expect(progress.dataset.loading).toBe("false");
	});

	it("marks the loader as active when queries are in flight", async () => {
		useIsFetchingMock.mockReturnValue(2);
		useIsMutatingMock.mockReturnValue(1);
		const GlobalLoadProgress = await loadComponent();
		render(<GlobalLoadProgress />);
		vi.advanceTimersByTime(TICK_INTERVAL_MS + 10);
		const progressStates = screen
			.getAllByTestId("global-load-progress")
			.map((element) => element.dataset.loading);
		expect(progressStates).toContain("true");
	});
});

