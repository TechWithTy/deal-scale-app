"use client";

import { CommandShortcut } from "../../../shadcn-table/src/components/ui/command";
import { ChevronRight } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../../../shadcn-table/src/components/ui/popover";
import type { CommandItem } from "../../utils/types";
import { extractYouTubeId } from "../../utils/media";
import { type ReactNode } from "react";

export type PreviewPopoverProps = {
	cmd: CommandItem;
	hoveredId: string | null;
	setHoveredId: (id: string | null) => void;
	// Called with whichever command (parent or child) was chosen
	onSelectCommand: (cmd: CommandItem, source: "list" | "popover") => void;
	CommandItemUI: (props: any) => ReactNode;
};

export default function PreviewPopover({
	cmd,
	hoveredId,
	setHoveredId,
	onSelectCommand,
	CommandItemUI,
}: PreviewPopoverProps) {
	const hasPreview = !!cmd.preview;
	const preview = cmd.preview;

	const renderPreview = () => {
		if (!preview) return null;
		if (preview.type === "image") {
			return (
				<div className="space-y-2">
					{preview.placeholder ? (
						<img
							src={preview.placeholder}
							alt={preview.alt ?? "Placeholder"}
							className="w-full rounded-md border border-border object-cover max-h-32"
						/>
					) : null}
					<img
						src={preview.src}
						alt={preview.alt ?? "Preview"}
						className="w-full rounded-md border border-border object-cover max-h-48"
						onError={(e) => {
							if (preview.placeholder)
								(e.currentTarget as HTMLImageElement).src = preview.placeholder;
						}}
					/>
				</div>
			);
		}
		const vid = extractYouTubeId(preview.src);
		const embed = `https://www.youtube.com/embed/${vid}?rel=0&controls=1`;
		return (
			<div className="space-y-2">
				{preview.placeholder ? (
					<img
						src={preview.placeholder}
						alt={preview.alt ?? "Thumbnail"}
						className="w-full rounded-md border border-border object-cover max-h-32"
					/>
				) : null}
				<div className="relative h-[180px] w-[320px]">
					<iframe
						className="rounded-md border border-border"
						width="320"
						height="180"
						src={embed}
						title={preview.alt ?? "YouTube preview"}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
					/>
				</div>
			</div>
		);
	};

	return (
		<Popover key={cmd.id} open={hoveredId === cmd.id}>
			<PopoverTrigger asChild>
				{/* Pass through the original CommandItem wrapper */}
				<CommandItemUI
					value={[cmd.label, ...(cmd.keywords ?? [])].join(" ")}
					onSelect={() => onSelectCommand(cmd, "list")}
					onMouseEnter={() => setHoveredId(cmd.id)}
					onMouseLeave={() => setHoveredId(null)}
					onFocus={() => setHoveredId(cmd.id)}
					onBlur={() => setHoveredId(null)}
					style={cmd.color ? { backgroundColor: cmd.color } : undefined}
				>
					{cmd.icon ? (
						<span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
							{cmd.icon}
						</span>
					) : null}
					<span className="truncate">{cmd.label}</span>
					{cmd.hint ? (
						<span className="ml-2 truncate text-muted-foreground">
							{cmd.hint}
						</span>
					) : null}
					{cmd.shortcut ? (
						<CommandShortcut>{cmd.shortcut}</CommandShortcut>
					) : null}
					{cmd.children && cmd.children.length ? (
						<span className="ml-auto text-muted-foreground">
							<ChevronRight className="h-4 w-4" />
						</span>
					) : null}
				</CommandItemUI>
			</PopoverTrigger>
			{hasPreview || (cmd.children && cmd.children.length) ? (
				<PopoverContent
					sideOffset={8}
					align="start"
					className="w-auto max-w-[360px] p-2 !bg-background text-foreground ring-1 ring-border shadow-lg backdrop-blur-0"
					style={{
						backgroundColor: "var(--background)",
						color: "var(--foreground)",
					}}
					onMouseEnter={() => setHoveredId(cmd.id)}
					onMouseLeave={() => setHoveredId(null)}
					onFocus={() => setHoveredId(cmd.id)}
					onBlur={() => setHoveredId(null)}
				>
					{/* Preview (if any) */}
					{hasPreview ? (
						<button
							type="button"
							className="block w-full text-left focus:outline-none mb-2"
							onClick={() => onSelectCommand(cmd, "popover")}
							aria-label={`Use ${cmd.label}`}
						>
							{renderPreview()}
						</button>
					) : null}
					{/* Submenu (if any) */}
					{cmd.children && cmd.children.length ? (
						<div className="flex flex-col gap-1">
							{cmd.children.map((child) => (
								<button
									key={child.id}
									type="button"
									className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
									style={
										child.color ? { backgroundColor: child.color } : undefined
									}
									onClick={() => onSelectCommand(child, "popover")}
								>
									{child.icon ? (
										<span className="inline-flex h-4 w-4 items-center justify-center">
											{child.icon}
										</span>
									) : null}
									<span className="truncate">{child.label}</span>
									{child.hint ? (
										<span className="ml-2 truncate text-muted-foreground">
											{child.hint}
										</span>
									) : null}
								</button>
							))}
						</div>
					) : null}
				</PopoverContent>
			) : null}
		</Popover>
	);
}
