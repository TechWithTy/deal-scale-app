import React from "react";
(globalThis as typeof globalThis & { React?: typeof React }).React = React;
class MockResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
if (!("ResizeObserver" in globalThis)) {
	(
		globalThis as typeof globalThis & {
			ResizeObserver: typeof MockResizeObserver;
		}
	).ResizeObserver = MockResizeObserver;
}
if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = function scrollIntoView() {
		return undefined;
	};
}
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CommandPalette from "external/action-bar/components/command/CommandPalette";

const navigateMock = vi.fn();
const setAttachmentsMock = vi.fn();

vi.mock(
	"external/action-bar/components/providers/CommandPaletteProvider",
	() => ({
		useCommandPalette: () => ({
			aiSuggestEndpoint: "/api/ai/command-suggest",
			pathname: "/",
			navigate: navigateMock,
			externalUrlAttachments: [],
			setExternalUrlAttachments: setAttachmentsMock,
		}),
	}),
);

describe("CommandPalette nested commands", () => {
	it("expands lazily and renders pointer cursor on expandable rows", async () => {
		const parentActionMock = vi.fn();
		const typeActionMock = vi.fn();
		const childActionMock = vi.fn();

		const leafCommands = Array.from({ length: 14 }).map((_, index) => ({
			id: `campaign-${index}`,
			group: "Campaigns",
			label: `Campaign ${index}`,
			action: childActionMock,
		}));

		const typeCommand = {
			id: "campaigns-call",
			group: "Campaigns",
			label: "Call Campaigns",
			action: typeActionMock,
			children: leafCommands,
		};

		render(
			<CommandPalette
				isOpen
				onOpenChange={() => undefined}
				commands={[
					{
						id: "campaigns-root",
						group: "Campaigns",
						label: "Campaigns",
						action: parentActionMock,
						children: [typeCommand],
					},
				]}
			/>,
		);

		const parentRow = screen
			.getByText("Campaigns", { selector: "span" })
			.closest('[role="option"]');
		expect(parentRow !== null).toBe(true);
		expect(parentRow?.className.includes("cursor-pointer")).toBe(true);

		if (!parentRow) throw new Error("Campaign parent row not found");
		fireEvent.pointerDown(parentRow);
		fireEvent.click(parentRow);
		expect(parentActionMock).not.toHaveBeenCalled();

		const typeRow = screen
			.getByText("Call Campaigns", { selector: "span" })
			.closest('[role="option"]');
		expect(typeRow !== null).toBe(true);
		expect(typeRow?.className.includes("cursor-pointer")).toBe(true);
		if (!typeRow) throw new Error("Campaign type row not found");
		fireEvent.pointerDown(typeRow);
		fireEvent.click(typeRow);
		expect(typeActionMock).not.toHaveBeenCalled();

		// Default lazy batch renders up to 12 leaf children
		for (let i = 0; i < 12; i += 1) {
			const rendered = screen.queryByText(`Campaign ${i}`, {
				selector: "span",
			});
			expect(rendered !== null).toBe(true);
		}
		expect(screen.queryByText("Campaign 13", { selector: "span" })).toBeNull();

		const showMoreButton = screen.getByRole("button", {
			name: /Show 2 more/i,
		});
		fireEvent.click(showMoreButton);
		expect(
			screen.queryByText("Campaign 13", { selector: "span" }),
		).not.toBeNull();

		const childRow = screen
			.getByText("Campaign 3", { selector: "span" })
			.closest('[role="option"]');
		if (!childRow) throw new Error("Campaign child row not found");
		fireEvent.pointerDown(childRow);
		fireEvent.click(childRow);
		expect(childActionMock).toHaveBeenCalled();
	});
});
