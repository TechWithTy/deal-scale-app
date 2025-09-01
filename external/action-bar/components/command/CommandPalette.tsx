"use client";

import {
	Command as CommandKey,
	Image as ImageIcon,
	Link2,
	Paperclip,
	X,
	Youtube,
} from "lucide-react";
import {
	type FC,
	useEffect,
	useMemo,
	useRef,
	useState,
	type DragEvent,
} from "react";
import { Badge } from "../../../shadcn-table/src/components/ui/badge";
import { Button } from "../../../shadcn-table/src/components/ui/button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem as CommandItemUI,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "../../../shadcn-table/src/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../../../shadcn-table/src/components/ui/popover";
import { aiToCommandItems, fetchAISuggestions } from "../../utils/ai";
import type { CommandItem } from "../../utils/types";
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
	const { aiSuggestEndpoint, pathname, navigate } = useCommandPalette();

	// Controlled query for AI suggestions
	const [q, setQ] = useState("");
	const [aiItems, setAiItems] = useState<CommandItem[]>([]);
	const [hoveredId, setHoveredId] = useState<string | null>(null);

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

	function extractYouTubeId(s: string) {
		try {
			if (s.includes("youtube.com") || s.includes("youtu.be")) {
				const u = new URL(s);
				if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
				const v = u.searchParams.get("v");
				if (v) return v;
				const parts = u.pathname.split("/");
				return parts[parts.length - 1] || s;
			}
			return s;
		} catch {
			return s;
		}
	}

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

	// Attachments: parse URLs in the query and show as removable chips under the input.
	type Attachment = { type: "image" | "youtube" | "url"; value: string };
	const attachments = useMemo<Attachment[]>(() => {
		if (!q) return [];
		const urls = Array.from(new Set(q.match(/https?:\/\/\S+/gi) ?? []));
		return urls.map((u) => {
			if (u.includes("youtu.be") || u.includes("youtube.com")) {
				return { type: "youtube", value: u } as Attachment;
			}
			if (/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(u)) {
				return { type: "image", value: u } as Attachment;
			}
			return { type: "url", value: u } as Attachment;
		});
	}, [q]);

	function escapeRegExp(s: string) {
		return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	function removeAttachment(value: string) {
		setQ((prev) =>
			prev
				// remove URL with optional surrounding whitespace
				.replace(new RegExp(`\\s*${escapeRegExp(value)}`, "g"), "")
				.replace(/\s{2,}/g, " ")
				.trim(),
		);
	}

	// File attachments as chips (not part of the query string)
	type FileAttachment = {
		id: string;
		type: "image-file" | "file";
		file: File;
		url: string; // object URL for quick preview/open
	};

	const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	function addFiles(files: FileList) {
		const next: FileAttachment[] = [];
		Array.from(files).forEach((f) => {
			const url = URL.createObjectURL(f);
			const type: FileAttachment["type"] = f.type.startsWith("image/")
				? "image-file"
				: "file";
			next.push({
				id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
				type,
				file: f,
				url,
			});
		});
		if (next.length) setFileAttachments((prev) => [...prev, ...next]);
	}

	function onDropZoneDragOver(e: DragEvent<HTMLDivElement>) {
		e.preventDefault();
		setIsDragging(true);
	}

	function onDropZoneDragLeave() {
		setIsDragging(false);
	}

	function onDropZoneDrop(e: DragEvent<HTMLDivElement>) {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer?.files && e.dataTransfer.files.length) {
			addFiles(e.dataTransfer.files);
		}
	}

	function removeFileAttachment(id: string) {
		setFileAttachments((prev) => {
			const item = prev.find((p) => p.id === id);
			if (item) URL.revokeObjectURL(item.url);
			return prev.filter((p) => p.id !== id);
		});
	}

	const groupKeys = Object.keys(groups);

	const content = (
		<>
			{/* Input + chip tray with drop support */}
			<div
				className={`border-b px-3 py-2 ${isDragging ? "bg-accent/30" : ""}`}
				onDragOver={onDropZoneDragOver}
				onDragLeave={onDropZoneDragLeave}
				onDrop={onDropZoneDrop}
				aria-label="Command input and attachment tray"
			>
				<div className="flex items-center gap-2">
					<div className="flex-1">
						<CommandInput
							placeholder="Type a command or search..."
							value={q}
							onValueChange={setQ}
						/>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Attach files"
						onClick={() => fileInputRef.current?.click()}
						className="h-8 w-8"
						title="Attach files"
					>
						<Paperclip className="h-4 w-4" />
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						multiple
						className="hidden"
						onChange={(e) => {
							if (e.currentTarget.files) addFiles(e.currentTarget.files);
							// reset to allow same file re-select
							e.currentTarget.value = "";
						}}
					/>
				</div>

				{/* Chip tray */}
				{attachments.length > 0 || fileAttachments.length > 0 ? (
					<div
						className="mt-2 flex flex-wrap items-center gap-1.5"
						role="list"
						aria-label="Attachments"
					>
						{attachments.map((a) => (
							<Badge
								key={a.value}
								variant="secondary"
								className="flex max-w-full items-center gap-1"
								role="listitem"
							>
								{a.type === "image" ? (
									<ImageIcon className="h-3.5 w-3.5" />
								) : a.type === "youtube" ? (
									<Youtube className="h-3.5 w-3.5" />
								) : (
									<Link2 className="h-3.5 w-3.5" />
								)}
								<span className="max-w-[240px] truncate" title={a.value}>
									{a.value}
								</span>
								<button
									type="button"
									className="ml-1 rounded p-0.5 hover:bg-accent"
									aria-label={`Remove ${a.value}`}
									onClick={(e) => {
										e.stopPropagation();
										removeAttachment(a.value);
									}}
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}

						{fileAttachments.map((f) => (
							<Badge
								key={f.id}
								variant="secondary"
								className="flex max-w-full items-center gap-1"
								role="listitem"
								title={f.file.name}
							>
								{f.type === "image-file" ? (
									<ImageIcon className="h-3.5 w-3.5" />
								) : (
									<Paperclip className="h-3.5 w-3.5" />
								)}
								<span className="max-w-[200px] truncate">{f.file.name}</span>
								<a
									href={f.url}
									target="_blank"
									rel="noreferrer"
									className="ml-1 rounded p-0.5 hover:bg-accent"
									aria-label={`Open ${f.file.name}`}
								>
									<Link2 className="h-3 w-3" />
								</a>
								<button
									type="button"
									className="ml-1 rounded p-0.5 hover:bg-accent"
									aria-label={`Remove ${f.file.name}`}
									onClick={(e) => {
										e.stopPropagation();
										removeFileAttachment(f.id);
									}}
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
				) : null}
			</div>

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
														className="w-full rounded-md border object-cover max-h-32"
													/>
												) : null}
												<img
													src={preview.src}
													alt={preview.alt ?? "Preview"}
													className="w-full rounded-md border object-cover max-h-48"
													onError={(e) => {
														if (preview.placeholder)
															(e.currentTarget as HTMLImageElement).src =
																preview.placeholder;
													}}
												/>
											</div>
										);
									}
									// youtube
									const vid = extractYouTubeId(preview.src);
									const embed = `https://www.youtube.com/embed/${vid}?rel=0&controls=1`;
									return (
										<div className="space-y-2">
											{preview.placeholder ? (
												<img
													src={preview.placeholder}
													alt={preview.alt ?? "Thumbnail"}
													className="w-full rounded-md border object-cover max-h-32"
												/>
											) : null}
											<div className="relative w-[320px] h-[180px]">
												<iframe
													className="rounded-md border"
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
											<CommandItemUI
												value={[cmd.label, ...(cmd.keywords ?? [])].join(" ")}
												onSelect={() => handleSelect(cmd, "list")}
												onMouseEnter={() => setHoveredId(cmd.id)}
												onMouseLeave={() =>
													setHoveredId((id) => (id === cmd.id ? null : id))
												}
												onFocus={() => setHoveredId(cmd.id)}
												onBlur={() =>
													setHoveredId((id) => (id === cmd.id ? null : id))
												}
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
											</CommandItemUI>
										</PopoverTrigger>
										{hasPreview ? (
											<PopoverContent
												sideOffset={8}
												align="start"
												className="w-auto max-w-[360px] p-2"
												onMouseEnter={() => setHoveredId(cmd.id)}
												onMouseLeave={() =>
													setHoveredId((id) => (id === cmd.id ? null : id))
												}
												onFocus={() => setHoveredId(cmd.id)}
												onBlur={() =>
													setHoveredId((id) => (id === cmd.id ? null : id))
												}
											>
												<button
													type="button"
													className="block w-full text-left focus:outline-none"
													onClick={() => handleSelect(cmd, "popover")}
													aria-label={`Use ${cmd.label}`}
												>
													{renderPreview()}
												</button>
											</PopoverContent>
										) : null}
									</Popover>
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
					<div className="fixed right-6 bottom-24 z-50 w-[min(90vw,28rem)] rounded-lg border bg-popover text-popover-foreground shadow-xl">
						<Command className="[&_[cmdk-input-wrapper]]:rounded-t-lg">
							{content}
							<CommandSeparator />
							<CommandGroup heading="Actions">
								<CommandItemUI
									onSelect={() => onOpenChange(false)}
									className="bg-destructive/10 text-destructive hover:bg-destructive/15 focus:bg-destructive/20"
								>
									<X className="mr-2 h-4 w-4" />
									<span>Close Floating Icon</span>
									<CommandShortcut>Esc</CommandShortcut>
								</CommandItemUI>
							</CommandGroup>
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
