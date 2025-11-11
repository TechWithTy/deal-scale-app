import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LaunchOverlay from "@/components/quickstart/launch/LaunchOverlay";

vi.mock("@/hooks/usePrefersReducedMotion", () => ({
	__esModule: true,
	default: () => true,
	usePrefersReducedMotion: () => true,
}));

describe("LaunchOverlay", () => {
	it("renders loading state when open", () => {
		render(<LaunchOverlay open status="configuring" />);

		expect(
			screen.getByText("Creating your AI workspace…"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Configuring workflows"),
		).toBeInTheDocument();
	});

	it("renders completion state", () => {
		render(<LaunchOverlay open status="done" />);

		expect(
			screen.getByText("Your AI Workspace is Ready 🚀"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Redirecting to your workspace…"),
		).toBeInTheDocument();
	});

	it("shows error message with close button", () => {
		const onClose = vi.fn();
		render(
			<LaunchOverlay
				open
				status="error"
				onClose={onClose}
				errorMessage="Unable to launch workspace."
			/>,
		);

		expect(screen.getByText("We hit a snag")).toBeInTheDocument();
		expect(
			screen.getByText("Unable to launch workspace."),
		).toBeInTheDocument();

		screen.getByRole("button", { name: /Close overlay/i }).click();
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});

