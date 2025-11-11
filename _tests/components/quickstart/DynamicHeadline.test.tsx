import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import DynamicHeadline from "@/components/quickstart/DynamicHeadline";
import { getQuickStartHeadlineCopy } from "@/lib/config/quickstart/headlines";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";

vi.mock("@/components/ui/globe", () => ({
	Globe: () => <div data-testid="globe-mock" />,
}));

describe("DynamicHeadline", () => {
	afterEach(() => {
		cleanup();
		useQuickStartWizardDataStore.setState({
			personaId: null,
			goalId: null,
		});
		vi.useRealTimers();
	});

	it("renders the default segmented copy when no persona is selected", () => {
		render(<DynamicHeadline />);

		expect(screen.getAllByText("AI Seller Qualification").length).toBeGreaterThan(
			0,
		);
		expect(screen.getAllByText("Dealmakers").length).toBeGreaterThan(0);

		expect(screen.getByTestId("quickstart-problem").textContent).toBe(
			"juggling tools",
		);
		expect(screen.getByTestId("quickstart-solution").textContent).toBe(
			"automating your pipeline",
		);
		expect(screen.getByTestId("quickstart-fear").textContent).toBe(
			"your competitors steal your next deal",
		);
		expect(
			screen.getByTestId("quickstart-headline-subtitle").textContent,
		).toBe(
			"Join 200+ dealmakers already automating. Launch your first AI campaign with DealScale Quick Start in under 5 minutes.",
		);
		expect(screen.getByTestId("quickstart-headline-title").textContent).toBe(
			"Stop juggling tools, start automating your pipeline - before your competitors steal your next deal.",
		);
	});

	it("registers interval rotations when multiple variants exist", () => {
		vi.useFakeTimers();
		const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

		render(<DynamicHeadline />);

		expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5200);
		expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 6800);
		expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 6000);

		setIntervalSpy.mockRestore();
	});

	it("switches to agent persona copy when store persona changes", () => {
		useQuickStartWizardDataStore.setState({
			personaId: "agent",
			goalId: null,
		});

		render(<DynamicHeadline />);

		expect(screen.getByTestId("quickstart-problem").textContent).toBe(
			"wasting hours on follow-ups",
		);
		expect(screen.getByTestId("quickstart-solution").textContent).toBe(
			"closing more deals",
		);
		expect(screen.getByTestId("quickstart-fear").textContent).toBe(
			"your pipeline goes cold",
		);
		expect(screen.getByTestId("quickstart-headline-title").textContent).toBe(
			"Stop wasting hours on follow-ups, start closing more deals - before your pipeline goes cold.",
		);
	});
});

