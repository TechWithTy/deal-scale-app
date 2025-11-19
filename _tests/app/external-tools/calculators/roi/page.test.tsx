import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubGlobal("React", React);

const authMock = vi.fn();
const roiSpy = vi.fn();

vi.mock("@/auth", () => ({
	auth: authMock,
}));

vi.mock("external/calculators", () => ({
	DealScaleRoiCalculator: (props: unknown) => {
		roiSpy(props);
		return <div data-testid="roi-calculator" />;
	},
}));

describe("External ROI calculator page", () => {
	beforeEach(() => {
		authMock.mockResolvedValue({
			tier: "Pro",
			quickStartDefaults: {
				personaId: "wholesaler",
				goalId: "scale_leads",
			},
		});
		roiSpy.mockClear();
	});

	it("renders the ROI calculator with the current session", async () => {
		const Page = (
			await import("@/app/external-tools/calculators/roi/page")
		).default;

		render(await Page({}));

		expect(
			screen.getByRole("heading", { name: /deal scale roi calculator/i }),
		).toBeInTheDocument();

		expect(roiSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				session: expect.objectContaining({
					tier: "Pro",
				}),
			}),
		);
	});
});












