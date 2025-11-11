import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { HeroVideoPreview } from "@external/dynamic-hero/components/hero-video-preview";

const VIDEO_CONFIG = {
	src: "https://www.youtube.com/embed/qh3NGpYRG3I?rel=0&controls=1",
	poster: "/images/preview.png",
	provider: "youtube" as const,
};

describe("HeroVideoPreview", () => {
	test("renders thumbnail image with provided alt text", () => {
		render(
			<HeroVideoPreview
				video={VIDEO_CONFIG}
				thumbnailAlt="Automated outreach preview"
			/>,
		);

		const thumbnail = screen.getByRole("img", {
			name: "Automated outreach preview",
		});

		expect(thumbnail).toHaveAttribute("src", VIDEO_CONFIG.poster);
	});
});

