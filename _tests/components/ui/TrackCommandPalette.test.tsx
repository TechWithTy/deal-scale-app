import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TrackCommandPalette } from "@/components/ui/track-command-palette";

(globalThis as unknown as { React: typeof React }).React = React;

beforeAll(() => {
	Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
		configurable: true,
		value: vi.fn(),
	});
});

afterEach(() => {
	cleanup();
});
const MOCK_OPTIONS = [
	{
		id: "session-thread-25-5",
		name: "Deep Focus 25/5",
		category: "My Sessions",
		types: ["session", "focus"],
		description: "Structured focus loop.",
		icon: "message-square",
	},
	{
		id: "prompt-market-intro",
		name: "Market Intro Prompt",
		category: "Sales Scripts & Prompts",
		types: ["prompt", "intro", "market"],
		description: "Warm outreach opener.",
	},
];

const SESSION_ONLY_OPTIONS = [
	{
		id: "session-thread-25-5",
		name: "Deep Focus 25/5",
		category: "My Sessions",
		types: ["session", "focus"],
		description: "Structured focus loop.",
		icon: "message-square",
	},
];

describe("TrackCommandPalette filtering", () => {
	it("limits type filters to the active category", () => {
		render(
			<TrackCommandPalette
				triggerLabel="Open palette"
				options={MOCK_OPTIONS}
			/>,
		);

		const [trigger] = screen.getAllByRole("button", { name: /open palette/i });
		fireEvent.click(trigger);

		const categoryTrigger = screen.getByRole("button", { name: "Categories" });
		fireEvent.click(categoryTrigger);

		const categoryChips = screen.getByTestId("category-filter-chips");
		fireEvent.click(
			within(categoryChips).getByRole("button", {
				name: "Sales Scripts & Prompts",
			}),
		);

		const typeTrigger = screen.getByRole("button", { name: "Types" });
		fireEvent.click(typeTrigger);

		const typeChips = screen.getByTestId("type-filter-chips");
		expect(within(typeChips).getByRole("button", { name: "prompt" })).toBeInTheDocument();
		expect(
			within(typeChips).queryByRole("button", { name: "session" }),
		).toBeNull();
		fireEvent.click(
			within(typeChips).getByRole("button", { name: "prompt" }),
		);

		expect(screen.getByText("Market Intro Prompt")).toBeInTheDocument();
		expect(screen.queryByText("Deep Focus 25/5")).toBeNull();
	});

	it("renders session actions and supports bookmarking", async () => {
		const handleBookmark = vi.fn();
		const handleSelect = vi.fn();

		render(
			<TrackCommandPalette
				triggerLabel="Open palette"
				options={SESSION_ONLY_OPTIONS}
				onBookmarkToggle={handleBookmark}
				onSelect={handleSelect}
			/>,
		);

		const [trigger] = screen.getAllByRole("button", { name: /open palette/i });
		fireEvent.click(trigger);

		const bookmarkButton = (
			await screen.findAllByLabelText(/bookmark deep focus 25\/5/i)
		)[0];
		fireEvent.click(bookmarkButton);
		expect(handleBookmark).toHaveBeenCalledWith(
			expect.objectContaining({ id: "session-thread-25-5" }),
		);

		const openButton = (
			await screen.findAllByLabelText(/open deep focus 25\/5/i)
		)[0];
		fireEvent.click(openButton);
		expect(handleSelect).toHaveBeenCalledWith(
			expect.objectContaining({ id: "session-thread-25-5" }),
		);
	});
});

