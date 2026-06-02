import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";

vi.mock("@/components/home/chat-workbench", () => ({
	ChatWorkbench: () => (
		<div>
			<h1>Chat first. Manual second.</h1>
			<p>Submodule mounted directly in the main app</p>
			<div role="tab">Chat</div>
			<div role="tab">Manual</div>
		</div>
	),
}));

describe("HomePage", () => {
	it("renders the chat workbench headline", () => {
		render(<HomePage />);

		expect(
			screen.getByRole("heading", {
				name: /chat first\. manual second\./i,
			}),
		).toBeInTheDocument();
		expect(
			screen.getByText(/submodule mounted directly in the main app/i),
		).toBeInTheDocument();
	});

	it("renders the chat and manual tabs", () => {
		render(<HomePage />);

		expect(
			screen.getAllByRole("tab", {
				name: /chat/i,
			})[0],
		).toBeInTheDocument();
		expect(
			screen.getAllByRole("tab", {
				name: /manual/i,
			})[0],
		).toBeInTheDocument();
	});
});
