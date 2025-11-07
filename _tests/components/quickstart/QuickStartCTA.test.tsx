import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import QuickStartCTA from "@/components/quickstart/QuickStartCTA";

describe("QuickStartCTA", () => {
	afterEach(() => {
		cleanup();
		useQuickStartWizardDataStore.setState({
			personaId: null,
			goalId: null,
		});
	});

	it("renders only the primary CTA when display mode is primary", () => {
		render(<QuickStartCTA displayMode="primary" />);

		const primaryButton = screen.getByRole("button", {
			name: /launch my first ai campaign/i,
		});
		expect(primaryButton).not.toBeNull();
		expect(
			screen.queryByRole("button", {
				name: /see how it works/i,
			}),
		).toBeNull();
	});

	it("renders both CTAs when display mode is both", () => {
		render(<QuickStartCTA displayMode="both" />);

		expect(
			screen.getByRole("button", { name: /launch my first ai campaign/i }),
		).not.toBeNull();
		expect(
			screen.getByRole("button", { name: /see how it works/i }),
		).not.toBeNull();
	});

	it("uses persona-specific CTA copy when persona is set", () => {
		useQuickStartWizardDataStore.setState({
			personaId: "investor",
			goalId: null,
		});

		render(<QuickStartCTA displayMode="both" />);

		expect(
			screen.getByRole("button", { name: /automate my next deal/i }),
		).not.toBeNull();
		expect(
			screen.getByText(/See how top investors keep their pipeline warm/i),
		).toBeTruthy();
	});

	it("calls the provided callbacks when CTAs are clicked", () => {
		const handlePrimary = vi.fn();
		const handleSecondary = vi.fn();

		render(
			<QuickStartCTA
				displayMode="both"
				onPrimaryClick={handlePrimary}
				onSecondaryClick={handleSecondary}
			/>,
		);

		fireEvent.click(
			screen.getByRole("button", { name: /launch my first ai campaign/i }),
		);
		fireEvent.click(
			screen.getByRole("button", { name: /see how it works/i }),
		);

		expect(handlePrimary).toHaveBeenCalledTimes(1);
		expect(handleSecondary).toHaveBeenCalledTimes(1);
	});
});

