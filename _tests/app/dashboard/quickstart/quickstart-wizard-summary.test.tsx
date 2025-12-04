import React from "react";
import { act, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import QuickStartWizard from "@/components/quickstart/wizard/QuickStartWizard";
import { getQuickStartTemplate } from "@/lib/config/quickstart/templates";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { renderWithNuqs } from "./testUtils";

(globalThis as Record<string, unknown>).React = React;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const resetStores = () => {
	act(() => {
		useQuickStartWizardStore.getState().reset();
		useQuickStartWizardDataStore.getState().reset();
	});
};

describe("QuickStart wizard summary previews", () => {
	beforeEach(() => {
		resetStores();
	});

	it("shows the template defaults preview for the lender automation play", async () => {
		renderWithNuqs(<QuickStartWizard />);

		act(() => {
			useQuickStartWizardStore.getState().open({
				personaId: "loan_officer",
				goalId: "lender-fund-fast",
				templateId: "automation-routing",
			});
		});

		const storeState = useQuickStartWizardStore.getState();
		expect(storeState.activePreset?.templateId).toBe("automation-routing");
		expect(getQuickStartTemplate("automation-routing")).toBeDefined();

		const summary = await screen.findByTestId("quickstart-summary-step");
		within(summary).getByRole("heading", { name: /fund deals faster/i });
		within(summary).getByText(
			/Automation routing keeps borrowers moving from intake to funding\./i,
		);
		const templatePreview = await within(summary).findByTestId(
			"quickstart-summary-template",
		);
		within(templatePreview).getByText(
			/Automation defaults coordinate borrower intake/i,
		);

		const bulletItems = within(templatePreview).getAllByRole("listitem");
		const bulletText = bulletItems.map((item) => item.textContent ?? "");

		expect(bulletText).toEqual(
			expect.arrayContaining([
				expect.stringMatching(/Primary channel: Text/i),
				expect.stringMatching(/Workflow: Aggressive: 3-day blitz/i),
				expect.stringMatching(/Assigned agent: Jane Smith/i),
				expect.stringMatching(
					/Automation rules: Hot borrower follow-up • Stalled deal escalation/i,
				),
				expect.stringMatching(/Webhook subscriptions: Borrower intake/i),
			]),
		);
	});
});
