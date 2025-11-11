"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { VoicePaletteOption } from "@/types/focus";
import {
	ArrowUpRight,
	Bookmark,
	BookmarkCheck,
	ChevronDown,
	X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TrackPaletteTriggerVariant = "default" | "icon";

const SESSION_THREAD_PREFIX = "session-thread-";

interface TrackCommandPaletteProps {
	triggerLabel?: string;
	triggerVariant?: TrackPaletteTriggerVariant;
	triggerIcon?: ReactNode;
	placeholder?: string;
	options: VoicePaletteOption[];
	onSelect?: (agent: VoicePaletteOption) => void;
	iconResolver?: (
		icon?: string,
	) => React.ComponentType<{ className?: string }> | null;
	onBookmarkToggle?: (option: VoicePaletteOption) => void;
}

export function TrackCommandPalette({
	triggerLabel = "Assign agent",
	triggerVariant = "default",
	triggerIcon,
	placeholder = "Search by name or tag…",
	options,
	onSelect,
	iconResolver,
	onBookmarkToggle,
}: TrackCommandPaletteProps): ReactElement {
	const categories = useMemo(() => {
		return [...new Set(options.map((option) => option.category))].sort();
	}, [options]);
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [activeType, setActiveType] = useState<string | null>(null);
	const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
	const [typePopoverOpen, setTypePopoverOpen] = useState(false);
	const types = useMemo(() => {
		if (!activeCategory) {
			return [];
		}
		const source = options.filter(
			(option) => option.category === activeCategory,
		);
		return [...new Set(source.flatMap((option) => option.types))].sort();
	}, [activeCategory, options]);

	useEffect(() => {
		if (activeType && !types.includes(activeType)) {
			setActiveType(null);
		}
	}, [activeType, types]);

	useEffect(() => {
		if (!activeCategory) {
			setTypePopoverOpen(false);
		}
	}, [activeCategory]);

	useEffect(() => {
		if (!open) return;
		const keyListener = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				setOpen(false);
			}
		};
		window.addEventListener("keydown", keyListener);
		return () => window.removeEventListener("keydown", keyListener);
	}, [open]);

	const filteredOptions = useMemo(() => {
		return options.filter((option) => {
			if (activeCategory && option.category !== activeCategory) return false;
			if (activeType && !option.types.includes(activeType)) return false;
			if (!search) return true;
			const value = search.toLowerCase();
			return (
				option.name.toLowerCase().includes(value) ||
				option.types.some((type) => type.toLowerCase().includes(value)) ||
				option.description?.toLowerCase().includes(value)
			);
		});
	}, [activeCategory, activeType, options, search]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				{triggerVariant === "icon" ? (
					<Button
						type="button"
						size="icon"
						variant="outline"
						className="h-10 w-10 rounded-full border-primary/40 bg-primary/10 text-primary shadow-md transition hover:border-primary/60 hover:bg-primary/20"
						aria-expanded={open}
						aria-label={triggerLabel}
					>
						{triggerIcon ?? <span className="text-lg">⌘</span>}
					</Button>
				) : (
					<Button
						type="button"
						variant="outline"
						className="flex h-9 min-w-[200px] items-center justify-between gap-2 rounded-full border-primary/40 bg-background px-3 font-semibold text-primary text-xs shadow-sm hover:border-primary/60"
						aria-expanded={open}
					>
						<span>{triggerLabel}</span>
						<Badge
							suppressHydrationWarning
							variant="outline"
							className="rounded-full border-primary/20 bg-primary/10 px-2 py-0 font-medium text-[10px] text-primary uppercase tracking-wide"
						>
							⌘⇧S
						</Badge>
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent
				className="z-[1400] w-[320px] rounded-2xl border border-primary/20 bg-background/95 p-0 shadow-2xl backdrop-blur"
				align="start"
				sideOffset={12}
				collisionPadding={16}
			>
				<Command>
					<CommandInput
						value={search}
						onValueChange={setSearch}
						placeholder={placeholder}
						className="rounded-t-2xl bg-primary/5 text-xs"
					/>
					<div className="flex flex-wrap items-center gap-2 px-3 pt-3 pb-2">
						<Popover
							modal={false}
							open={categoryPopoverOpen}
							onOpenChange={setCategoryPopoverOpen}
						>
							<PopoverTrigger asChild>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="h-7 gap-1 rounded-full px-3 text-[11px]"
									aria-expanded={categoryPopoverOpen}
									onMouseDown={(event) => {
										event.preventDefault();
									}}
								>
									<span>{activeCategory ?? "Categories"}</span>
									<ChevronDown className="h-3 w-3" aria-hidden />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="z-[1500] w-[260px] rounded-lg border border-primary/20 bg-background/95 p-2 shadow-lg backdrop-blur"
								align="start"
								sideOffset={8}
							>
								<div
									className="flex flex-wrap items-center gap-2"
									data-testid="category-filter-chips"
								>
									<button
										type="button"
										className={cn(
											"rounded-full border px-2 py-1 text-[10px] transition focus:outline-none focus:ring-2 focus:ring-primary/30",
											!activeCategory
												? "border-primary bg-primary text-primary-foreground"
												: "border-primary/30 bg-primary/5 text-primary hover:border-primary/60",
										)}
										onClick={() => {
											setActiveCategory(null);
											setCategoryPopoverOpen(false);
										}}
									>
										All categories
									</button>
									{categories.map((category) => {
										const isActive = category === activeCategory;
										return (
											<button
												key={category}
												type="button"
												className={cn(
													"rounded-full border px-2 py-1 text-[10px] transition focus:outline-none focus:ring-2 focus:ring-primary/30",
													isActive
														? "border-primary bg-primary text-primary-foreground"
														: "border-primary/30 bg-primary/5 text-primary hover:border-primary/60",
												)}
												onClick={() => {
													setActiveCategory((prev) =>
														prev === category ? null : category,
													);
													setCategoryPopoverOpen(false);
												}}
											>
												{category}
											</button>
										);
									})}
								</div>
							</PopoverContent>
						</Popover>
						{activeCategory && types.length > 0 ? (
							<Popover
								modal={false}
								open={typePopoverOpen}
								onOpenChange={setTypePopoverOpen}
							>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="h-7 gap-1 rounded-full px-3 text-[11px]"
										aria-expanded={typePopoverOpen}
										onMouseDown={(event) => {
											event.preventDefault();
										}}
									>
										<span>{activeType ?? "Types"}</span>
										<ChevronDown className="h-3 w-3" aria-hidden />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="z-[1500] w-[240px] rounded-lg border border-primary/20 bg-background/95 p-2 shadow-lg backdrop-blur"
									align="start"
									sideOffset={8}
								>
									<div
										className="flex flex-wrap items-center gap-2"
										data-testid="type-filter-chips"
									>
										<button
											type="button"
											className={cn(
												"rounded-full border px-2 py-1 text-[10px] transition focus:outline-none focus:ring-2 focus:ring-primary/30",
												!activeType
													? "border-primary bg-primary text-primary-foreground"
													: "border-primary/30 bg-primary/5 text-primary hover:border-primary/60",
											)}
											onClick={() => {
												setActiveType(null);
												setTypePopoverOpen(false);
											}}
										>
											All types
										</button>
										{types.map((type) => {
											const isActive = type === activeType;
											return (
												<button
													key={type}
													type="button"
													className={cn(
														"rounded-full border px-2 py-1 text-[10px] transition focus:outline-none focus:ring-2 focus:ring-primary/30",
														isActive
															? "border-primary bg-primary text-primary-foreground"
															: "border-primary/30 bg-primary/5 text-primary hover:border-primary/60",
													)}
													onClick={() => {
														setActiveType((prev) =>
															prev === type ? null : type,
														);
														setTypePopoverOpen(false);
													}}
												>
													{type}
												</button>
											);
										})}
									</div>
								</PopoverContent>
							</Popover>
						) : null}
						{activeCategory ? (
							<Badge
								variant="secondary"
								className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px]"
							>
								<span>{activeCategory}</span>
								<button
									type="button"
									onClick={() => setActiveCategory(null)}
									className="rounded-full p-0.5 hover:bg-primary/10"
									aria-label="Clear category filter"
								>
									<X className="h-3 w-3" aria-hidden />
								</button>
							</Badge>
						) : null}
						{activeType ? (
							<Badge
								variant="outline"
								className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px]"
							>
								<span>{activeType}</span>
								<button
									type="button"
									onClick={() => setActiveType(null)}
									className="rounded-full p-0.5 hover:bg-primary/10"
									aria-label="Clear type filter"
								>
									<X className="h-3 w-3" aria-hidden />
								</button>
							</Badge>
						) : null}
					</div>
					<CommandList className="max-h-64">
						<CommandEmpty className="p-4 text-muted-foreground text-xs">
							No options match your filters.
						</CommandEmpty>
						<CommandGroup>
							{filteredOptions.map((option) => (
								<CommandItem
									key={option.id}
									value={option.name}
									onSelect={() => {
										setOpen(false);
										if (onSelect) onSelect(option);
									}}
									className="flex items-start justify-between gap-2 rounded-xl px-3 py-2 text-xs"
								>
									{(() => {
										const Icon = iconResolver?.(option.icon);
										const isSession = option.types.includes("session");
										const sessionThreadId = option.id.startsWith(
											SESSION_THREAD_PREFIX,
										)
											? option.id.slice(SESSION_THREAD_PREFIX.length)
											: null;
										const showSessionActions = Boolean(sessionThreadId);
										const isBookmarked =
											showSessionActions && Boolean(option.bookmarked);
										return (
											<>
												<span className="flex flex-col text-left gap-1">
													<span className="flex items-center gap-2 text-primary">
														{Icon ? (
															<Icon className="h-4 w-4" aria-hidden />
														) : null}
														<span className="font-medium">{option.name}</span>
														{option.badge ? (
															<Badge
																variant="outline"
																className="border-primary/20 bg-primary/10 text-[9px] uppercase tracking-wide"
															>
																{option.badge}
															</Badge>
														) : null}
													</span>
													<span className="text-[11px] text-muted-foreground">
														{option.category}
													</span>
													{option.description ? (
														<span className="text-[11px] text-muted-foreground/80">
															{option.description}
														</span>
													) : null}
												</span>
												<span className="flex flex-col items-end gap-1">
													<span className="flex flex-wrap justify-end gap-1">
														{option.types.map((type) => (
															<Badge
																key={type}
																variant="outline"
																className="rounded-full border-primary/20 px-2 py-0 text-[10px]"
															>
																{type}
															</Badge>
														))}
													</span>
													{showSessionActions && onBookmarkToggle ? (
														<div className="flex gap-1">
															<button
																type="button"
																onMouseDown={(event) => event.preventDefault()}
																onClick={(event) => {
																	event.preventDefault();
																	event.stopPropagation();
																	if (onSelect) onSelect(option);
																	setOpen(false);
																}}
																className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-primary transition hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
																aria-label={`Open ${option.name}`}
															>
																<ArrowUpRight
																	className="h-3.5 w-3.5"
																	aria-hidden
																/>
															</button>
															<button
																type="button"
																onMouseDown={(event) => event.preventDefault()}
																onClick={(event) => {
																	event.preventDefault();
																	event.stopPropagation();
																	onBookmarkToggle(option);
																}}
																className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-primary transition hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
																aria-label={
																	isBookmarked
																		? `Remove bookmark for ${option.name}`
																		: `Bookmark ${option.name}`
																}
															>
																{isBookmarked ? (
																	<BookmarkCheck
																		className="h-3.5 w-3.5"
																		aria-hidden
																	/>
																) : (
																	<Bookmark
																		className="h-3.5 w-3.5"
																		aria-hidden
																	/>
																)}
															</button>
														</div>
													) : null}
												</span>
											</>
										);
									})()}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
					<div className="flex items-center justify-between border-primary/10 border-t px-3 py-2 text-[11px] text-muted-foreground">
						<span>Press ⏎ to assign or Esc to cancel.</span>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="text-xs"
							onClick={() => setOpen(false)}
						>
							Close
						</Button>
					</div>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
