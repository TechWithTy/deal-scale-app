import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.stubGlobal("React", React);
vi.mock("@/auth", () => ({
	auth: vi.fn().mockResolvedValue(null),
}));

describe("External tools landing page", () => {
	it("lists the calculator hub with a public URL", async () => {
		const Page = (await import("@/app/external-tools/page")).default;

		render(await Page({}));

		expect(
			screen.getByRole("heading", {
				name: /external growth tools/i,
			}),
		).toBeInTheDocument();

		const calculatorsLink = screen.getAllByRole("link", {
			name: /explore tool/i,
		})[0];

		expect(calculatorsLink).toHaveAttribute(
			"href",
			"/external-tools/calculators",
		);
	});
});
