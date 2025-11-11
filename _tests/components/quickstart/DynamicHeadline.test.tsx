import React, { act } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import DynamicHeadline from "@/components/quickstart/DynamicHeadline";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";

vi.mock("@/components/ui/globe", () => ({
  Globe: () => <div data-testid="globe-mock" />,
}));

const layoutCalls: Array<{ text: string; words: string[]; duration?: number }> = [];

vi.mock("@/src/components/ui/layout-text-flip", () => ({
  LayoutTextFlip: (props: { text: string; words: string[]; duration?: number }) => {
    layoutCalls.push(props);
    return <div data-testid="layout-text-flip-mock">{props.text}</div>;
  },
}));

describe("DynamicHeadline", () => {
	afterEach(() => {
		cleanup();
		useQuickStartWizardDataStore.setState({
			personaId: null,
			goalId: null,
		});
		vi.useRealTimers();
		layoutCalls.length = 0;
	});

	it("renders the default segmented copy when no persona is selected", () => {
		render(<DynamicHeadline />);

		expect(screen.getByText("AI Seller Qualification")).toBeTruthy();
		const chips = screen.getAllByText("Dealmakers");
		expect(chips.length).toBeGreaterThan(0);

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

	it("passes highlight words to the animated headline", () => {
		render(<DynamicHeadline />);

		const latestCall = layoutCalls.at(-1);
		expect(latestCall).toBeDefined();
		expect(latestCall?.words).toEqual([
			"Start automating your pipeline",
			"Start closing more deals",
			"Start syncing every CRM automatically",
		]);
		expect(latestCall?.duration).toBe(3200);
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

