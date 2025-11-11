import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.stubGlobal("React", React);

import { mockAnalyticsData } from "@/constants/_faker/analytics/charts";

vi.mock("next/dynamic", () => {
	return {
		__esModule: true,
		default: () => {
			const DynamicStub = () => null;
			return DynamicStub;
		},
	};
});

vi.mock("@/app/dashboard/charts/hooks/useAnalyticsData", () => ({
	useAnalyticsData: () => ({
		data: mockAnalyticsData,
		loading: false,
		error: null,
		refetch: vi.fn(),
	}),
}));

vi.mock("@/hooks/useNetworkQuality", () => ({
	useNetworkQuality: () => ({
		tier: "slow",
		downlink: 0.15,
		effectiveType: "2g",
	}),
}));

// eslint-disable-next-line import/first
import ChartsPage from "@/app/dashboard/charts/page";

describe("ChartsPage slow network behaviour", () => {
	it("renders the network fallback when the connection tier is slow", () => {
		render(<ChartsPage />);

		expect(
			screen.getByText(/charts paused to save bandwidth/i),
		).toBeInTheDocument();
	});
});

