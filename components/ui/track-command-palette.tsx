"use client";

import { useEffect, useMemo, useState } from "react";

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

export interface TrackAgentOption {
	id: string;
	name: string;
	category: string;
	types: string[];
}

interface TrackCommandPaletteProps {
	triggerLabel?: string;
	placeholder?: string;
	options: TrackAgentOption[];
	onSelect?: (agent: TrackAgentOption) => void;
}

export function TrackCommandPalette({
	triggerLabel = "Assign agent",
	placeholder = "Search by name or tag…",
	options,
	onSelect,
}: TrackCommandPaletteProps): React.ReactElement {
	const categories = useMemo(() => {
		return [...new Set(options.map((option) => option.category))].sort();
	}, [options]);
	const types = useMemo(() => {
		return [...new Set(options.flatMap((option) => option.types))].sort();
	}, [options]);
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [activeType, setActiveType] = useState<string | null>(null);

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
				option.types.some((type) => type.toLowerCase().includes(value))
			);
		});
	}, [activeCategory, activeType, options, search]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
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
					<div className="flex items-center gap-2 px-3 pt-3 pb-2">
						<div className="flex flex-wrap items-center gap-2">
							<Badge
								variant={activeCategory ? "outline" : "default"}
								className="cursor-pointer rounded-full px-2 py-1 text-[10px]"
								onClick={() => setActiveCategory(null)}
							>
								All categories
							</Badge>
							{categories.map((category) => (
								<Badge
									key={category}
									variant={activeCategory === category ? "default" : "outline"}
									className="cursor-pointer rounded-full px-2 py-1 text-[10px]"
									onClick={() =>
										setActiveCategory((prev) =>
											prev === category ? null : category,
										)
									}
								>
									{category}
								</Badge>
							))}
						</div>
					</div>
					<div className="flex items-center gap-2 px-3 pb-2">
						<div className="flex flex-wrap items-center gap-2">
							<Badge
								variant={activeType ? "outline" : "default"}
								className="cursor-pointer rounded-full px-2 py-1 text-[10px]"
								onClick={() => setActiveType(null)}
							>
								All types
							</Badge>
							{types.map((type) => (
								<Badge
									key={type}
									variant={activeType === type ? "default" : "outline"}
									className="cursor-pointer rounded-full px-2 py-1 text-[10px]"
									onClick={() =>
										setActiveType((prev) => (prev === type ? null : type))
									}
								>
									{type}
								</Badge>
							))}
						</div>
					</div>
					<CommandList className="max-h-64">
						<CommandEmpty className="p-4 text-muted-foreground text-xs">
							No agents match your filters.
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
									<span className="flex flex-col text-left">
										<span className="font-medium text-primary">
											{option.name}
										</span>
										<span className="text-[11px] text-muted-foreground">
											{option.category}
										</span>
									</span>
									<span className="flex flex-wrap gap-1">
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
