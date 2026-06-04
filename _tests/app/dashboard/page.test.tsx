import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardHomePage from "@/app/dashboard/page";

vi.mock("@/components/home/chat-workbench", () => ({
	ChatWorkbench: ({ embedded }: { embedded?: boolean }) => (
		<div>
			<h1>Dashboard workspace</h1>
			<p>{embedded ? "Embedded workbench" : "Standalone workbench"}</p>
			<div role="tab">Chat</div>
			<div role="tab">Manual</div>
		</div>
	),
}));

describe("DashboardHomePage", () => {
	it("renders the embedded chat and manual workspace", () => {
		render(<DashboardHomePage />);

		expect(
			screen.getByRole("heading", { name: /dashboard workspace/i }),
		).toBeInTheDocument();
		expect(screen.getByText(/embedded workbench/i)).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "Chat" })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "Manual" })).toBeInTheDocument();
	});
});
