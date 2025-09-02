import type { ReactNode } from "react";

export type CommandPreview = {
	type: "image" | "youtube";
	// For image, src is the image URL; For youtube, src is a video ID or full URL
	src: string;
	// Optional placeholder image shown above the preview (e.g., thumbnail)
	placeholder?: string;
	alt?: string;
};

export type CommandActionPayload = {
	// Media context derived from the command's preview metadata
	media?: {
		type: "image" | "youtube";
		src: string;
		// For YouTube, we also provide a parsed id and an embeddable URL for convenience
		id?: string;
		embedUrl?: string;
		placeholder?: string;
		alt?: string;
	};
	// Where this action was initiated from
	source?: "list" | "popover";
};

export type CommandItem = {
	id: string;
	group: string; // e.g., "Navigation", "Leaderboard", "Settings"
	label: string;
	hint?: string; // optional subtitle or description
	icon?: ReactNode; // optional icon node
	shortcut?: string; // display-only keyboard shortcut label
	action: (payload?: CommandActionPayload) => void; // callback when selected
	keywords?: string[]; // for matching/filtering
	role?: "guest" | "auth" | "any";
	// Optional media preview to show on hover inside the palette
	preview?: CommandPreview;
	// Optional background color for the item row (e.g., "var(--accent)" or "#222")
	color?: string;
	// Optional submenu items
	children?: CommandItem[];
};

export type CommandPaletteContextValue = {
	isOpen: boolean;
	setOpen: (v: boolean) => void;
	commands: CommandItem[];
	setCommands: (items: CommandItem[]) => void;
	registerDynamicCommands: (items: CommandItem[]) => void;
	initialQuery: string;
	setInitialQuery: (q: string) => void;
	variant: "dialog" | "floating";
	setVariant: (v: "dialog" | "floating") => void;
	aiSuggestEndpoint: string;
	pomFlowUrl?: string;
	keyboard: boolean;
	pathname: string;
	navigate: (path: string) => void;
	// External URL attachments to render as chips independent of the input text
	externalUrlAttachments: string[];
	setExternalUrlAttachments: (urls: string[]) => void;
};

export type ActionBarController = {
	open: () => void;
	close: () => void;
	toggle: () => void;
	register: (items: CommandItem[]) => void;
	setVariant: (v: "dialog" | "floating") => void;
	setInitialQuery: (q: string) => void;
	setEndpoint: (ep: string) => void;
	setKeyboard: (enabled: boolean) => void;
	setExternalUrls?: (urls: string[]) => void;
};
