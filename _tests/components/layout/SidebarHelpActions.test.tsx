import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SidebarHelpActions from "@/components/layout/SidebarHelpActions";

const setOpenMock = vi.fn();
const setInitialQueryMock = vi.fn();

vi.mock(
	"external/action-bar/components/providers/CommandPaletteProvider",
	() => ({
		useCommandPalette: () => ({
			setOpen: setOpenMock,
			setInitialQuery: setInitialQueryMock,
		}),
	}),
);

afterEach(() => {
	cleanup();
	setOpenMock.mockReset();
	setInitialQueryMock.mockReset();
});

beforeEach(() => {
	setOpenMock.mockClear();
	setInitialQueryMock.mockClear();
});

describe("SidebarHelpActions", () => {
	it("opens the command palette with a cleared query", () => {
		render(<SidebarHelpActions isCollapsed={false} />);

		fireEvent.click(screen.getByRole("button", { name: /assist/i }));

		expect(setInitialQueryMock).toHaveBeenCalledWith("");
		expect(setOpenMock).toHaveBeenCalledWith(true);
	});

	it("renders an icon-only trigger when collapsed", () => {
		render(<SidebarHelpActions isCollapsed />);

		const triggerList = screen.getAllByRole("button", { name: /assist/i });
		const trigger = triggerList.at(-1);
		expect(trigger).toBeDefined();
		expect(trigger?.className).toContain("sidebar-help-trigger");
	});
});
