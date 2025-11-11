"use client";

import {
	Command as CommandKey,
	ChevronDown,
	ChevronRight,
	X,
} from "lucide-react";
import {
	type FC,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
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

const DEFAULT_VISIBLE_PER_GROUP = 6;
const DEFAULT_VISIBLE_CHILDREN = 12;

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

	const [q, setQ] = useState("");
	const [aiItems, setAiItems] = useState<CommandItem[]>([]);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
	const [childVisibleCounts, setChildVisibleCounts] = useState<
		Record<string, number>
	>({});

	useEffect(() => {
		if (isOpen) {
			setQ(initialQuery);
		}
	}, [isOpen, initialQuery]);

	const trimmedQuery = q.trim();

	useEffect(() => {
		if (!trimmedQuery) {
			setVisibleCounts({});
		}
	}, [trimmedQuery]);

	useEffect(() => {
		if (!trimmedQuery || trimmedQuery.length < 2) {
			setAiItems([]);
			return;
		}
		const id = window.setTimeout(async () => {
			const suggestions = await fetchAISuggestions(
				trimmedQuery,
				pathname,
				aiSuggestEndpoint,
			);
			const run = (path?: string) => (path ? navigate(path) : undefined);
			setAiItems(aiToCommandItems(suggestions, run));
		}, 220);
		return () => window.clearTimeout(id);
	}, [trimmedQuery, pathname, aiSuggestEndpoint, navigate]);

	useEffect(() => {
		if (variant !== "floating" || !isOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onOpenChange(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [variant, isOpen, onOpenChange]);

	const combined = useMemo(
		() => (aiItems.length ? [...aiItems, ...commands] : commands),
		[aiItems, commands],
	);

	const groups = combined.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
		const key = cmd.group || "General";
		if (!acc[key]) acc[key] = [];
		acc[key].push(cmd);
		return acc;
	}, {});

	const toggleExpand = useCallback(
		(id: string, childCount = 0) => {
			setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
			setVisibleCounts((prev) => ({ ...prev, [id]: Number.MAX_SAFE_INTEGER }));
			if (childCount > 0) {
				setChildVisibleCounts((prev) => ({
					...prev,
					[id]: trimmedQuery.length
						? childCount
						: Math.min(childCount, DEFAULT_VISIBLE_CHILDREN),
				}));
			}
		},
		[trimmedQuery.length],
	);

	function handleSelect(cmd: CommandItem, source: "list" | "popover" = "list") {
		if (cmd.children && cmd.children.length) {
			toggleExpand(cmd.id, cmd.children.length);
			return;
		}
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

	const groupKeys = Object.keys(groups);

	const renderCommandNode = useCallback(
		(cmd: CommandItem, depth = 0): ReactNode => {
			const hasChildren = Array.isArray(cmd.children) && cmd.children.length > 0;
			const paddingLeft = depth > 0 ? depth * 16 : undefined;
			if (!hasChildren) {
				return (
					<div key={cmd.id} style={{ paddingLeft }}>
						<PreviewPopover
							cmd={cmd}
							hoveredId={hoveredId}
							setHoveredId={setHoveredId}
							onSelectCommand={(selected, source) =>
								handleSelect(selected, source)
							}
							CommandItemUI={CommandItemUI as unknown as any}
						/>
					</div>
				);
			}
			const isOpen = !!expanded[cmd.id];
			const limit = trimmedQuery.length
				? cmd.children!.length
				: childVisibleCounts[cmd.id] ?? DEFAULT_VISIBLE_CHILDREN;
			const childrenToRender = cmd.children!.slice(0, limit);
			const remaining = cmd.children!.length - childrenToRender.length;
			return (
				<div key={cmd.id} style={{ paddingLeft }}>
					<CommandItemUI
						value={[cmd.label, ...(cmd.keywords ?? [])].join(" ")}
						onSelect={() => toggleExpand(cmd.id, cmd.children!.length)}
						className="flex cursor-pointer items-center justify-between"
					>
						<div className="flex items-center gap-2">
							{cmd.icon ? <span className="shrink-0">{cmd.icon}</span> : null}
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
					{isOpen ? (
						<>
							{childrenToRender.map((child) =>
								renderCommandNode(child, depth + 1),
							)}
							{!trimmedQuery.length && remaining > 0 ? (
								<button
									className="ml-6 w-full cursor-pointer px-2 py-1 text-left text-xs font-medium uppercase text-primary"
									type="button"
									onClick={() =>
										setChildVisibleCounts((prev) => ({
											...prev,
											[cmd.id]: Math.min(
												cmd.children!.length,
												(childrenToRender.length ?? 0) +
													DEFAULT_VISIBLE_CHILDREN,
											),
										}))
									}
								>
									Show {remaining} more
								</button>
							) : null}
						</>
					) : null}
				</div>
			);
		},
		[
			hoveredId,
			expanded,
			trimmedQuery.length,
			handleSelect,
			toggleExpand,
			childVisibleCounts,
			setChildVisibleCounts,
		],
	);

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
				{groupKeys.map((g, gi) => {
					const groupItems = groups[g];
					const showAll = trimmedQuery.length > 0;
					const limit = showAll
						? groupItems.length
						: visibleCounts[g] ?? DEFAULT_VISIBLE_PER_GROUP;
					const visibleItems = groupItems.slice(0, limit);
					const remaining = groupItems.length - visibleItems.length;

					return (
						<div key={g}>
							<CommandGroup heading={g}>
								{visibleItems.map((cmd) => renderCommandNode(cmd))}
								{!showAll && remaining > 0 ? (
									<CommandItemUI
										onSelect={() =>
											setVisibleCounts((prev) => ({
												...prev,
												[g]: groupItems.length,
											}))
										}
										className="flex cursor-pointer items-center justify-center text-xs font-medium uppercase text-primary"
									>
										Show {remaining} more
									</CommandItemUI>
								) : null}
							</CommandGroup>
							{gi < groupKeys.length - 1 ? <CommandSeparator /> : null}
						</div>
					);
				})}
			</CommandList>
		</>
	);

	if (variant === "floating") {
		return (
			<>
				{isOpen ? (
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
				) : null}
				{isOpen ? (
					<>
						<div
							className="fixed inset-0 z-40"
							onClick={() => onOpenChange(false)}
							aria-hidden="true"
						/>
						<div
							className="fixed right-6 bottom-24 z-50 w-[min(90vw,28rem)] rounded-lg border border-border bg-background text-foreground shadow-xl"
							style={{
								backgroundColor: "var(--background)",
								color: "var(--foreground)",
							}}
						>
							<div className="flex items-center justify-end p-2">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label="Close"
									onClick={() => onOpenChange(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
							<Command className="[&_[cmdk-input-wrapper]]:rounded-t-lg">
								{content}
							</Command>
						</div>
					</>
				) : null}
			</>
		);
	}

	return (
		<CommandDialog open={isOpen} onOpenChange={onOpenChange} label="Command Palette">
			{content}
		</CommandDialog>
	);
};

export default CommandPalette;
