"use client";

import { Command as CommandKey, ChevronDown, ChevronRight } from "lucide-react";
import { type FC, useEffect, useMemo, useState } from "react";
import { Button } from "../../../shadcn-table/src/components/ui/button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandItem as CommandItemUI,
	CommandList,
	CommandSeparator,
} from "../../../shadcn-table/src/components/ui/command";
import { aiToCommandItems, fetchAISuggestions } from "../../utils/ai";
import type { CommandItem } from "../../utils/types";
import { extractYouTubeId } from "../../utils/media";
import CommandInputTray from "./CommandInputTray";
import PreviewPopover from "./PreviewPopover";
import { useCommandPalette } from "../providers/CommandPaletteProvider";

export type CommandPaletteProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	commands: CommandItem[];
	initialQuery?: string;
	variant?: "dialog" | "floating";
};

const CommandPalette: FC<CommandPaletteProps> = ({
	isOpen,
	onOpenChange,
	commands,
	initialQuery = "",
	variant = "dialog",
}) => {
	const {
		aiSuggestEndpoint,
		pathname,
		navigate,
		externalUrlAttachments,
		setExternalUrlAttachments,
	} = useCommandPalette();

	// Controlled query for AI suggestions
	const [q, setQ] = useState("");
	const [aiItems, setAiItems] = useState<CommandItem[]>([]);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});

	// Seed query when opening
	useEffect(() => {
		if (isOpen) {
			setQ(initialQuery);
		}
	}, [isOpen, initialQuery]);

	// Debounce query
	useEffect(() => {
		if (!q || q.trim().length < 2) {
			setAiItems([]);
			return;
		}
		const id = window.setTimeout(async () => {
			const suggestions = await fetchAISuggestions(
				q.trim(),
				pathname,
				aiSuggestEndpoint,
			);
			const run = (path?: string) => (path ? navigate(path) : undefined);
			setAiItems(aiToCommandItems(suggestions, run));
		}, 220);
		return () => window.clearTimeout(id);
	}, [q, pathname, aiSuggestEndpoint, navigate]);

	// Combine AI items on top
	const combined = useMemo(
		() => (aiItems.length ? [...aiItems, ...commands] : commands),
		[aiItems, commands],
	);

	// Group commands by group label
	const groups = combined.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
		const key = cmd.group || "General";
		if (!acc[key]) acc[key] = [];
		acc[key].push(cmd);
		return acc;
	}, {});

	function handleSelect(cmd: CommandItem, source: "list" | "popover" = "list") {
		const preview = cmd.preview;
		const media =
			preview?.type === "youtube"
				? (() => {
						const id = extractYouTubeId(preview.src);
						const embedUrl = `https://www.youtube.com/embed/${id}?rel=0&controls=1`;
						return {
							type: "youtube" as const,
							src: preview.src,
							id,
							embedUrl,
							placeholder: preview.placeholder,
							alt: preview.alt,
						};
					})()
				: preview?.type === "image"
					? {
							type: "image" as const,
							src: preview.src,
							placeholder: preview.placeholder,
							alt: preview.alt,
						}
					: undefined;

		cmd.action?.({ media, source });
		onOpenChange(false);
	}

	function toggleExpand(id: string) {
		setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
	}

	const groupKeys = Object.keys(groups);

	const content = (
		<>
			<CommandInputTray
				q={q}
				setQ={setQ}
				externalUrls={externalUrlAttachments}
				setExternalUrls={setExternalUrlAttachments}
			/>
			<CommandList>
				<CommandEmpty>
					<div className="py-6 text-center text-sm">
						No results yet. Try searching for a player, action, or type “rank”.
					</div>
				</CommandEmpty>
				{groupKeys.map((g, gi) => (
					<div key={g}>
						<CommandGroup heading={g}>
							{groups[g].map((cmd) => {
								const hasChildren =
									Array.isArray(cmd.children) && cmd.children.length > 0;
								if (!hasChildren) {
									return (
										<PreviewPopover
											key={cmd.id}
											cmd={cmd}
											hoveredId={hoveredId}
											setHoveredId={setHoveredId}
											onSelectCommand={(selected, source) =>
												handleSelect(selected, source)
											}
											CommandItemUI={CommandItemUI as unknown as any}
										/>
									);
								}

								const isOpen = !!expanded[cmd.id];
								return (
									<div key={cmd.id}>
										<CommandItemUI
											onSelect={() => toggleExpand(cmd.id)}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-2">
												{cmd.icon ? (
													<span className="shrink-0">{cmd.icon}</span>
												) : null}
												<span>{cmd.label}</span>
											</div>
											<span className="text-muted-foreground">
												{isOpen ? (
													<ChevronDown className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)}
											</span>
										</CommandItemUI>
										{isOpen
											? cmd.children!.map((child) => (
													<div key={child.id} className="pl-6">
														<PreviewPopover
															cmd={child}
															hoveredId={hoveredId}
															setHoveredId={setHoveredId}
															onSelectCommand={(selected, source) =>
																handleSelect(selected, source)
															}
															CommandItemUI={CommandItemUI as unknown as any}
														/>
													</div>
												))
											: null}
									</div>
								);
							})}
						</CommandGroup>
						{gi < groupKeys.length - 1 ? <CommandSeparator /> : null}
					</div>
				))}
			</CommandList>
		</>
	);

	if (variant === "floating") {
		return (
			<>
				{/* Floating Action Button */}
				<div className="fixed right-6 bottom-6 z-50">
					<Button
						type="button"
						className="h-12 w-12 rounded-full p-0 shadow-lg"
						onClick={() => onOpenChange(!isOpen)}
						aria-label={
							isOpen
								? "Close floating command palette"
								: "Open floating command palette"
						}
					>
						<CommandKey className="h-5 w-5" />
					</Button>
				</div>
				{/* Floating Panel */}
				{isOpen ? (
					<div
						className="fixed right-6 bottom-24 z-50 w-[min(90vw,28rem)] rounded-lg border border-border bg-background text-foreground shadow-xl"
						style={{
							backgroundColor: "var(--background)",
							color: "var(--foreground)",
						}}
					>
						<Command className="[&_[cmdk-input-wrapper]]:rounded-t-lg">
							{content}
						</Command>
					</div>
				) : null}
			</>
		);
	}

	return (
		<CommandDialog open={isOpen} onOpenChange={onOpenChange}>
			{content}
		</CommandDialog>
	);
};

export default CommandPalette;
