import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";

const { authMock } = vi.hoisted(() => ({
	authMock: vi.fn(),
}));

vi.mock("@/auth", () => ({
	auth: authMock,
}));

vi.mock("@/components/home/authenticated-home-shell", () => ({
	AuthenticatedHomeShell: () => (
		<div>
			<h1>Chat first. Manual second.</h1>
			<p>Chat and quick start live together</p>
			<div role="tab">Chat</div>
			<div role="tab">Manual</div>
		</div>
	),
}));

vi.mock("@/app/(auth)/signin/page", () => ({
	default: () => (
		<div>
			<h1>Demo login</h1>
			<p>Mocked users available</p>
			<button type="button">Sign in</button>
		</div>
	),
}));

describe("HomePage", () => {
	it("renders the chat workbench for authenticated users", async () => {
		authMock.mockResolvedValue({ user: { id: "user-1" } });
		const page = await HomePage();
		render(page);

		expect(
			screen.getByRole("heading", {
				name: /chat first\. manual second\./i,
			}),
		).toBeInTheDocument();
		expect(
			screen.getByText(/chat and quick start live together/i),
		).toBeInTheDocument();
	});

	it("renders the demo login components when signed out", async () => {
		authMock.mockResolvedValue(null);
		const page = await HomePage();
		render(page);

		expect(
			screen.getByRole("heading", {
				name: /demo login/i,
			}),
		).toBeInTheDocument();
		expect(
			screen.getByText(/mocked users available/i),
		).toBeInTheDocument();
	});
});
