import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { renderToString } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import {
	AppTourProvider,
	useAppTour,
} from "@/external/interactive-avatar-nextjs-demo/components/tour/AppTourProvider";

function StartTourButton() {
	const { startTour } = useAppTour();

	return (
		<button type="button" onClick={() => startTour()}>
			Start tour
		</button>
	);
}

beforeAll(() => {
	Element.prototype.scrollIntoView =
		Element.prototype.scrollIntoView ?? (() => {});
	HTMLElement.prototype.getBoundingClientRect =
		function getBoundingClientRect() {
			return {
				bottom: 80,
				height: 40,
				left: 20,
				right: 220,
				toJSON: () => {},
				top: 40,
				width: 200,
				x: 20,
				y: 40,
			};
		};
});

describe("AppTourProvider", () => {
	it("renders without passing the Joyride module object to React", () => {
		render(
			<AppTourProvider>
				<div>Tour child</div>
			</AppTourProvider>,
		);

		expect(screen.getByText("Tour child")).toBeInTheDocument();
	});

	it("keeps browser-only tour state out of the server markup", () => {
		const markup = renderToString(
			<AppTourProvider>
				<div>Tour child</div>
			</AppTourProvider>,
		);

		expect(markup).toContain("Tour child");
		expect(markup).not.toContain("react-floater");
	});

	it("opens the first app overview tooltip when a tour is started", async () => {
		render(
			<AppTourProvider>
				<div data-tour="sidebar-header">Sidebar header</div>
				<StartTourButton />
			</AppTourProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Start tour" }));

		await waitFor(() => {
			expect(
				screen.getByText(
					"Use the sidebar to switch chats, manage assets, connect tools, and configure agents.",
				),
			).toBeInTheDocument();
		});
	});
});
