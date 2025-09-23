import { createElement } from "react";
import { Sparkles, PlayCircle } from "lucide-react";
import type { CommandItem } from "../../utils/types";

/**
 * Registers Storybook demo commands (including nested sub-actions) for the Action Bar.
 * This keeps the app/test-external/storybook/page.tsx minimal and focused on wiring only.
 */
export type RegisterDemoDeps = {
	registerDynamicCommands: (items: CommandItem[]) => void;
	selectedText: string;
	addHighlight: () => void;
	setImageOpen: (open: boolean) => void;
	setImageSrc: (src: string) => void;
	setVideoOpen: (open: boolean) => void;
	setVideoUrl: (url: string) => void;
	videoUrl?: string | null;
};

export function registerStorybookDemoCommands({
	registerDynamicCommands,
	selectedText,
	addHighlight,
	setImageOpen,
	setImageSrc,
	setVideoOpen,
	setVideoUrl,
	videoUrl,
}: RegisterDemoDeps) {
	const items: CommandItem[] = [
		{
			id: "sb-media-youtube",
			group: "Action Bar Demo",
			label: "Play YouTube (Preview)",
			hint: "Opens the video modal with YouTube URL",
			icon: createElement(PlayCircle, { className: "h-4 w-4" }),
			preview: {
				type: "youtube",
				src: videoUrl || "",
				placeholder: "https://place-hold.it/300x500/666/fff",
				alt: "YouTube preview",
			},
			action: (payload) => {
				const media = payload?.media;
				if (media?.type === "youtube") {
					const id = media.id;
					if (id) {
						setVideoUrl(`https://www.youtube.com/watch?v=${id}`);
					} else if (media.src) {
						setVideoUrl(media.src);
					}
					setVideoOpen(true);
				}
			},
		},
		{
			id: "sb-tools",
			group: "Action Bar Demo",
			label: "Demo Tools",
			hint: "Expand to see sub-actions",
			icon: createElement(Sparkles, { className: "h-4 w-4" }),
			action: () => {
				// Parent does not execute; expansion is handled in UI
			},
			children: [
				{
					id: "sb-tools-highlight",
					group: "Action Bar Demo",
					label: "Highlight Selected Text",
					hint: selectedText
						? `"${selectedText.slice(0, 24)}"`
						: "No selection",
					action: () => {
						if (selectedText) addHighlight();
					},
					keywords: ["highlight", "selection"],
				},
				{
					id: "sb-tools-open-image",
					group: "Action Bar Demo",
					label: "Open Demo Image Modal",
					action: () => {
						setImageSrc("https://place-hold.it/300x500/666/fff");
						setImageOpen(true);
					},
					keywords: ["image", "modal"],
				},
				{
					id: "sb-tools-open-video",
					group: "Action Bar Demo",
					label: "Open Demo YouTube Modal",
					action: () => {
						setVideoUrl("https://www.youtube.com/watch?v=ysz5S6PUM-U");
						setVideoOpen(true);
					},
					keywords: ["youtube", "video"],
				},
			],
		},
	];

	registerDynamicCommands(items);
}
