import React from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { HeroVideoDialog } from "@external/dynamic-hero/components/hero-video-dialog";

const VIDEO_CONFIG = {
	src: "https://www.youtube.com/embed/qh3NGpYRG3I?rel=0&controls=1",
	poster: "https://cdn.example.com/preview.png",
	provider: "youtube" as const,
};

const HTML5_CONFIG = {
	src: "https://cdn.example.com/videos/demo.mp4",
	poster: "https://cdn.example.com/videos/demo.webp",
	provider: "html5" as const,
} as const;

describe("HeroVideoDialog", () => {
	test("opens the video dialog when thumbnail is clicked", async () => {
		render(
			<HeroVideoDialog
				video={VIDEO_CONFIG}
				thumbnailAlt="Preview video"
				className="w-full"
			/>,
		);

		const [trigger] = screen.getAllByRole("button", { name: "Play video" });
		fireEvent.click(trigger);

		expect(
			await screen.findByTitle("Hero Video player", undefined, {
				timeout: 1000,
			}),
		).toHaveAttribute("src", VIDEO_CONFIG.src);
	});

	test("renders html5 video element for html5 provider", async () => {
		render(
			<HeroVideoDialog
				video={HTML5_CONFIG}
				thumbnailAlt="HTML5 preview"
				className="w-full"
			/>,
		);

		const [trigger] = screen.getAllByRole("button", { name: "Play video" });
		fireEvent.click(trigger);

		const video = await screen.findByTestId("hero-video-html5", {
			timeout: 1000,
		});

		expect(video).toHaveAttribute("poster", HTML5_CONFIG.poster);
		const source = video.querySelector("source");
		expect(source).not.toBeNull();
		if (!source) {
			throw new Error("missing source element");
		}
		expect(source).toHaveAttribute("src", HTML5_CONFIG.src);
	});

	test("closes when overlay is clicked", async () => {
		render(
			<HeroVideoDialog
				video={VIDEO_CONFIG}
				thumbnailAlt="Preview video"
				className="w-full"
			/>,
		);

		const [trigger] = screen.getAllByRole("button", { name: "Play video" });
		fireEvent.click(trigger);

		const [closeButton] = await screen.findAllByRole("button", {
			name: "Close video",
		});
		fireEvent.click(closeButton);

		await waitFor(() => {
			expect(screen.queryByTitle("Hero Video player")).toBeNull();
		});
	});
});

