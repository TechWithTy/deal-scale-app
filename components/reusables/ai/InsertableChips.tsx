/**
 * Insertable Chips Component
 * Displays a searchable list of chips that can be inserted into a target input
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/_utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export interface InsertableChip {
	key: string;
	label: string;
	description?: string;
	icon?: React.ReactNode;
	locked?: boolean;
	lockedMessage?: string;
}

interface InsertableChipsProps {
	chips: InsertableChip[];
	onChipClick: (key: string) => void;
	label?: string;
	helpText?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	className?: string;
}

export function InsertableChips({
	chips,
	onChipClick,
	label = "Available Items (Click to Insert)",
	helpText = "Click items to insert into your text below",
	searchPlaceholder = "Search...",
	emptyMessage = "No items found",
	className = "",
}: InsertableChipsProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedChip, setSelectedChip] = useState<string | null>(null);

	// Filter chips based on search query
	const filteredChips = useMemo(() => {
		if (!searchQuery.trim()) return chips;
		const query = searchQuery.toLowerCase();
		return chips.filter(
			(chip) =>
				chip.key.toLowerCase().includes(query) ||
				chip.label.toLowerCase().includes(query) ||
				chip.description?.toLowerCase().includes(query),
		);
	}, [searchQuery, chips]);

	return (
		<div className={className}>
			{label && <Label className="text-sm mb-2 block">{label}</Label>}
			{/* Search Input */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder={searchPlaceholder}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-9 text-sm"
				/>
			</div>
			{/* Scrollable Chips */}
			<div className="mt-2 overflow-x-auto">
				<div className="flex min-w-max flex-nowrap gap-2 rounded-lg border bg-muted/30 p-2 sm:flex-wrap sm:min-w-0">
					{filteredChips.length > 0 ? (
						filteredChips.map((chip) => {
							const isSelected = selectedChip === chip.key;
							const isLocked = chip.locked || false;

							const chipBadge = (
								<Badge
									key={chip.key}
									variant="secondary"
									className={cn(
										"shrink-0 gap-1 transition-all",
										isLocked
											? "cursor-not-allowed opacity-60"
											: "cursor-pointer hover:bg-primary/20",
										isSelected && !isLocked
											? "bg-blue-500/40 text-blue-900 dark:text-blue-100 border-blue-500 ring-2 ring-blue-500/50"
											: "",
									)}
									onClick={() => {
										if (isLocked) return; // Prevent clicking on locked chips
										setSelectedChip(chip.key);
										onChipClick(chip.key);
										// Clear selection after a brief moment
										setTimeout(() => setSelectedChip(null), 300);
									}}
									title={isLocked ? undefined : chip.description}
								>
									{isLocked ? (
										<Lock className="h-3 w-3 shrink-0" />
									) : (
										chip.icon && <span className="shrink-0">{chip.icon}</span>
									)}
									{`{{${chip.key}}}`}
								</Badge>
							);

							// Wrap locked chips in a tooltip
							if (isLocked) {
								return (
									<TooltipProvider key={chip.key} delayDuration={200}>
										<Tooltip>
											<TooltipTrigger asChild>{chipBadge}</TooltipTrigger>
											<TooltipContent>
												<p className="text-xs">
													{chip.lockedMessage ||
														"🔒 Requires Starter+ plan to use"}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								);
							}

							return chipBadge;
						})
					) : (
						<p className="shrink-0 text-muted-foreground text-xs">
							{emptyMessage}
						</p>
					)}
				</div>
			</div>
			{helpText && (
				<p className="mt-2 text-muted-foreground text-xs">{helpText}</p>
			)}
		</div>
	);
}
