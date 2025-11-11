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

		expect(screen.getAllByText("AI QuickStart").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Revenue Teams").length).toBeGreaterThan(0);

		expect(screen.getByTestId("quickstart-problem").textContent).toBe(
			"wasting hours setting up campaigns",
		);
		expect(screen.getByTestId("quickstart-solution").textContent).toBe(
			"launching AI QuickStarts that sync your CRM",
		);
		expect(screen.getByTestId("quickstart-fear").textContent).toBe(
			"competitors follow up faster",
		);
		expect(screen.getByTestId("quickstart-hope").textContent).toBe(
			"waking up to appointments already queued for you",
		);
		expect(
			screen.getByTestId("quickstart-headline-subtitle").textContent,
		).toBe(
			"Join 200+ teams launching DealScale QuickStart each month. Kick off automation-ready onboarding with zero guesswork in under 5 minutes.",
		);
		expect(screen.getByTestId("quickstart-headline-title").textContent).toBe(
			"Stop wasting hours setting up campaigns, start launching AI QuickStarts that sync your CRM - before competitors follow up faster. Imagine waking up to appointments already queued for you.",
		);
	});

	it("registers interval rotations when multiple variants exist", () => {
		vi.useFakeTimers();
		const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

		render(<DynamicHeadline />);

		expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5200);
		expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 6800);
		expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 6000);
		expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 6400);

		setIntervalSpy.mockRestore();
	});

	it("switches to agent persona copy when store persona changes", () => {
		useQuickStartWizardDataStore.setState({
			personaId: "agent",
			goalId: null,
		});

		render(<DynamicHeadline />);

		expect(screen.getByTestId("quickstart-problem").textContent).toBe(
			"setting up real estate campaigns from scratch every time",
		);
		expect(screen.getByTestId("quickstart-solution").textContent).toBe(
			"a QuickStart that imports leads and syncs with your CRM in minutes",
		);
		expect(screen.getByTestId("quickstart-fear").textContent).toBe(
			"you keep guessing instead of working your best opportunities",
		);
		expect(screen.getByTestId("quickstart-hope").textContent).toBe(
			"your AI pipeline runs while you focus on clients",
		);
		expect(screen.getByTestId("quickstart-headline-title").textContent).toBe(
			"Stop setting up real estate campaigns from scratch every time, start a QuickStart that imports leads and syncs with your CRM in minutes - before you keep guessing instead of working your best opportunities. Imagine your AI pipeline runs while you focus on clients.",
		);
	});
});

