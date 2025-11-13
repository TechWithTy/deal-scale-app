import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.stubGlobal("React", React);

describe("External tools landing page", () => {
	it("lists the calculator hub with a public URL", async () => {
		const Page = (await import("@/app/external-tools/page")).default;

		render(await Page({}));

		expect(
			screen.getByRole("heading", {
				name: /external growth tools/i,
			}),
		).toBeInTheDocument();

		const calculatorsLink = screen.getByRole("link", {
			name: /calculator hub/i,
		});

		expect(calculatorsLink).toHaveAttribute(
			"href",
			"/external-tools/calculators",
		);
	});
});


