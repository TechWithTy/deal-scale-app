import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.stubGlobal("React", React);

const calculatorDefinitionsMock = [
	{
		id: "roi",
		title: "ROI Calculator",
		category: "Investment",
		description: "Estimate returns on a proposed deal.",
		Component: vi.fn(() => <div data-testid="roi-calculator" />),
	},
] as const;

const hubSpy = vi.fn();

vi.mock("external/calculators", () => ({
	calculatorDefinitions: calculatorDefinitionsMock,
}));

vi.mock("external/calculators/components/CalculatorHub", () => ({
	CalculatorHub: (props: unknown) => {
		hubSpy(props);
		return <div data-testid="calculator-hub" />;
	},
}));

describe("External calculators page", () => {
	it("renders the calculator hub with shared definitions", async () => {
		const Page = (await import("@/app/external-tools/calculators/page")).default;

		render(await Page({}));

		expect(
			screen.getByRole("heading", { name: /calculator hub/i }),
		).toBeInTheDocument();

		expect(hubSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				calculators: calculatorDefinitionsMock,
			}),
		);
	});
});


