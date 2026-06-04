import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthenticatedHomeShell } from "@/components/home/authenticated-home-shell";

const sidebarMock = vi.fn();
const headerMock = vi.fn();
const chatWorkbenchMock = vi.fn();

vi.mock("@/components/demo/DemoRevealWrapper", () => ({
	DemoRevealWrapper: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="demo-reveal-wrapper">{children}</div>
	),
}));

vi.mock("@/components/admin/ImpersonationBanner", () => ({
	default: () => <div data-testid="impersonation-banner">Impersonation banner</div>,
}));

vi.mock("@/components/layout/sidebar", () => ({
	__esModule: true,
	default: (props: { user: unknown }) => {
		sidebarMock(props);
		return <aside data-testid="app-sidebar">Sidebar</aside>;
	},
}));

vi.mock("@/components/layout/header", () => ({
	__esModule: true,
	default: () => {
		headerMock();
		return <header data-testid="app-header">Header</header>;
	},
}));

vi.mock("@/components/home/chat-workbench", () => ({
	ChatWorkbench: (props: { embedded?: boolean }) => {
		chatWorkbenchMock(props);
		return (
			<section data-testid="chat-workbench">
				<div role="tablist" aria-label="Home workspace tabs">
					<button role="tab" aria-selected="true" type="button">
						Chat
					</button>
					<button role="tab" aria-selected="false" type="button">
						Manual
					</button>
				</div>
			</section>
		);
	},
}));

describe("AuthenticatedHomeShell", () => {
	it("renders the existing app shell with the home workbench in the content pane", () => {
		render(<AuthenticatedHomeShell />);

		expect(screen.getByTestId("demo-reveal-wrapper")).toBeInTheDocument();
		expect(screen.getByTestId("app-sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("app-header")).toBeInTheDocument();
		expect(screen.getByTestId("impersonation-banner")).toBeInTheDocument();

		const workbench = screen.getByTestId("chat-workbench");
		const tabs = within(workbench).getAllByRole("tab");

		expect(tabs).toHaveLength(2);
		expect(within(workbench).getByRole("tab", { name: "Chat" })).toBeInTheDocument();
		expect(
			within(workbench).getByRole("tab", { name: "Manual" }),
		).toBeInTheDocument();

		expect(sidebarMock).toHaveBeenCalledTimes(1);
		expect(headerMock).toHaveBeenCalledTimes(1);
		expect(chatWorkbenchMock).toHaveBeenCalledWith(
			expect.objectContaining({ embedded: true }),
		);
	});
});
