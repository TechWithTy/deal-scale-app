import React from "react";
import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import QuickStartCrmSyncModal from "@/components/quickstart/QuickStartCrmSyncModal";

const renderModal = (
	props: Partial<ComponentProps<typeof QuickStartCrmSyncModal>> = {},
) =>
	render(
		<QuickStartCrmSyncModal
			isOpen
			connectedCrmNames={["GoHighLevel"]}
			onCancel={vi.fn()}
			onConfirm={vi.fn()}
			onAutoSelect={vi.fn()}
			{...props}
		/>,
	);

describe("QuickStartCrmSyncModal", () => {
	it("shows CRM label for single connection", () => {
		renderModal({ connectedCrmNames: ["Lofty CRM"] });

		expect(
			screen.getByRole("heading", {
				name: /sync Lofty CRM leads with DealScale/i,
			}),
		).toBeInTheDocument();
	});

	it("combines CRM names when multiple connections exist", () => {
		renderModal({ connectedCrmNames: ["GoHighLevel", "Lofty CRM"] });

		const matches = screen.getAllByText(/GoHighLevel & Lofty CRM/i);
		expect(matches.length).toBeGreaterThanOrEqual(1);
	});

	it("invokes callbacks for confirm and auto select actions", async () => {
		const onConfirm = vi.fn();
		const onAutoSelect = vi.fn();
		const onCancel = vi.fn();

		renderModal({ onConfirm, onAutoSelect, onCancel });

		fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
		expect(onConfirm).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByRole("button", { name: /ai auto select/i }));
		expect(onAutoSelect).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("respects disabled state for AI auto select", async () => {
		const onAutoSelect = vi.fn();
		renderModal({ isAutoSelectDisabled: true, onAutoSelect });

		const autoSelectButton = screen.getByRole("button", {
			name: /ai auto select/i,
		});
		expect(autoSelectButton).toBeDisabled();

		fireEvent.click(autoSelectButton);
		expect(onAutoSelect).not.toHaveBeenCalled();
	});
});
