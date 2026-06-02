import React from "react";
import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { TypewriterEffect } from "@/components/ui/typewriter-effect";

beforeAll(() => {
	vi.stubGlobal(
		"IntersectionObserver",
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	);
});

describe("TypewriterEffect", () => {
	it("uses a compact cursor size by default to pair with smaller text", () => {
		const { container } = render(
			<TypewriterEffect
				words={[
					{
						text: "AI",
					},
				]}
			/>,
		);

		const cursor = container.querySelector("span.bg-blue-500");
		expect(cursor).not.toBeNull();
		expect(cursor).toHaveClass("h-3");
		expect(cursor).toHaveClass("w-[2px]");
	});

	it("preserves readable spacing in rendered text content", () => {
		const sample = "Focus mode active for DealScale users.";
		const { container } = render(
			<TypewriterEffect
				words={[
					{
						text: sample,
					},
				]}
			/>,
		);

		expect(container.textContent?.replace(/\s+/g, " ").trim()).toContain(
			"Focus mode active for DealScale users.",
		);
	});
});
