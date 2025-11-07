"use client";

import {
	Star,
	StarOff,
	Sparkles,
	User,
	Clock,
	Search as SearchIcon,
	X,
	Lightbulb,
	TrendingUp,
	Globe,
	DollarSign as MonetizeIcon,
	Info,
	Calendar,
	LucideIcon,
} from "lucide-react";
import type { FC, ReactNode } from "react";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/_utils";

export type ItemType = "ai-generated" | "ai-suggested" | "manual";

export interface BaseItem {
	id: string;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
	monetization?: {
		enabled: boolean;
		priceMultiplier: number;
		isPublic: boolean;
		acceptedTerms: boolean;
	};
	priority?: boolean;
	useCount?: number;
}

interface SavedItemsModalProps<T extends BaseItem> {
	open: boolean;
	onClose: () => void;
	items: T[];
	title: string;
	searchPlaceholder: string;
	emptyStateIcon: LucideIcon;
	emptyStateText: string;
	emptyStateSubtext: string;
	itemTypeName: "workflow" | "template" | "search";
	fitScoreLabel: string;

	// Type determination
	getItemType: (item: T) => ItemType;

	// Filtering
	matchesSearchQuery: (item: T, query: string) => boolean;

	// Render functions
	renderMetadata: (item: T) => ReactNode;
	renderAIPrompt?: (item: T, itemType: ItemType) => ReactNode;

	// Actions
	onDelete: (id: string) => void;
	onSelect: (item: T) => void;
	onSetPriority?: (id: string) => void;
	onToggleMonetization: (id: string) => void;
	renderExtraActions?: (item: T) => ReactNode;

	// Button labels
	selectButtonLabel: string;
}

export function SavedItemsModal<T extends BaseItem>({
	open,
	onClose,
	items,
	title,
	searchPlaceholder,
	emptyStateIcon: EmptyStateIcon,
	emptyStateText,
	emptyStateSubtext,
	itemTypeName,
	fitScoreLabel,
	getItemType,
	matchesSearchQuery,
	renderMetadata,
	renderAIPrompt,
	onDelete,
	onSelect,
	onSetPriority,
	onToggleMonetization,
	renderExtraActions,
	selectButtonLabel,
}: SavedItemsModalProps<T>) {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState<
		"all" | "ai" | "ai-suggested" | "manual"
	>("all");
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	// Check if an item was updated
	const wasUpdated = (item: T): boolean => {
		if (!item.updatedAt || !item.createdAt) return false;
		const created = new Date(item.createdAt).getTime();
		const updated = new Date(item.updatedAt).getTime();
		return updated - created > 1000; // More than 1 second difference
	};

	// Calculate item fit score (mock - would be real analytics in production)
	const calculateFitScore = (item: T, timeframe: string): number => {
		const created = new Date(item.createdAt).getTime();
		const now = Date.now();
		const ageInDays = (now - created) / (1000 * 60 * 60 * 24);

		// Base score
		let score = 75;

		// Adjust based on type
		const type = getItemType(item);
		if (type === "ai-generated") score += 15;
		if (type === "ai-suggested") score += 10;

		// Adjust based on timeframe
		if (timeframe === "today") score -= 10;
		if (timeframe === "7days" && ageInDays >= 7) score += 5;
		if (timeframe === "month" && ageInDays >= 30) score += 10;

		// Adjust if priority
		if (item.priority) score += 5;

		// Adjust based on usage
		if (item.useCount && item.useCount > 5) score += 10;

		// Cap at 100
		return Math.min(100, Math.max(0, score));
	};

	// Filter items by query and type
	const filteredItems = useMemo(() => {
		let filtered = items;

		// Filter by type
		if (filterType === "ai") {
			filtered = filtered.filter(
				(item) => getItemType(item) === "ai-generated",
			);
		} else if (filterType === "ai-suggested") {
			filtered = filtered.filter(
				(item) => getItemType(item) === "ai-suggested",
			);
		} else if (filterType === "manual") {
			filtered = filtered.filter((item) => getItemType(item) === "manual");
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((item) => matchesSearchQuery(item, query));
		}

		// Sort by priority, then by date
		return filtered.sort((a, b) => {
			if (a.priority && !b.priority) return -1;
			if (!a.priority && b.priority) return 1;
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	}, [items, filterType, searchQuery, getItemType, matchesSearchQuery]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
			<div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col">
				{/* Header */}
				<div className="sticky top-0 z-10 bg-card border-b border-border p-4 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<EmptyStateIcon className="h-5 w-5 text-primary" />
							{title}
						</h2>
						<button
							type="button"
							onClick={onClose}
							className="p-1 hover:bg-accent rounded-md transition-colors"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Search Bar */}
					<div className="relative">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder={searchPlaceholder}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 pr-9"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded-sm"
							>
								<X className="h-3 w-3" />
							</button>
						)}
					</div>

					{/* Filter Tabs */}
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setFilterType("all")}
							className={cn(
								"px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
								filterType === "all"
									? "bg-primary text-primary-foreground"
									: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
							)}
						>
							All ({items.length})
						</button>
						<button
							type="button"
							onClick={() => setFilterType("ai")}
							className={cn(
								"px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
								filterType === "ai"
									? "bg-blue-500 text-white"
									: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
							)}
						>
							<Sparkles className="h-3 w-3" />
							AI
						</button>
						<button
							type="button"
							onClick={() => setFilterType("ai-suggested")}
							className={cn(
								"px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
								filterType === "ai-suggested"
									? "bg-amber-500 text-white"
									: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
							)}
						>
							<Lightbulb className="h-3 w-3" />
							Suggested
						</button>
						<button
							type="button"
							onClick={() => setFilterType("manual")}
							className={cn(
								"px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
								filterType === "manual"
									? "bg-slate-500 text-white"
									: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
							)}
						>
							<User className="h-3 w-3" />
							Manual
						</button>
					</div>
				</div>

				{/* Items List */}
				<div className="flex-1 overflow-y-auto p-4">
					{filteredItems.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<EmptyStateIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p className="text-lg font-medium">{emptyStateText}</p>
							<p className="text-sm">
								{searchQuery ? "Try a different search" : emptyStateSubtext}
							</p>
						</div>
					) : (
						<ul className="space-y-3">
							{filteredItems.map((item) => {
								const itemType = getItemType(item);
								const isUpdated = wasUpdated(item);
								const [fitTimeframe, setFitTimeframe] = useState("week");
								const fitScore = calculateFitScore(item, fitTimeframe);

								return (
									<li
										key={item.id}
										className={cn(
											"border rounded-lg p-4 transition-all hover:shadow-md",
											itemType === "ai-generated" &&
												"bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
											itemType === "ai-suggested" &&
												"bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
											itemType === "manual" &&
												"bg-slate-50/50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-800",
										)}
									>
										{/* Item Header */}
										<div className="flex items-start justify-between gap-3 mb-3">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1 flex-wrap">
													<h3 className="font-semibold text-base truncate">
														{item.name}
													</h3>
													{/* Type Badge */}
													{itemType === "ai-generated" && (
														<Badge
															variant="default"
															className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
														>
															<Sparkles className="h-3 w-3" />
															AI
														</Badge>
													)}
													{itemType === "ai-suggested" && (
														<Badge
															variant="default"
															className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1"
														>
															<Lightbulb className="h-3 w-3" />
															Suggested
														</Badge>
													)}
													{itemType === "manual" && (
														<Badge
															variant="outline"
															className="flex items-center gap-1"
														>
															<User className="h-3 w-3" />
															Manual
														</Badge>
													)}
													{/* Updated Badge */}
													{isUpdated && (
														<Badge
															variant="secondary"
															className="flex items-center gap-1"
														>
															<Clock className="h-3 w-3" />
															UPDATED
														</Badge>
													)}
													{/* Priority Star */}
													{item.priority && onSetPriority && (
														<Badge
															variant="default"
															className="bg-yellow-500 hover:bg-yellow-600 text-white"
														>
															<Star className="h-3 w-3 fill-current" />
														</Badge>
													)}
												</div>
												{item.description && (
													<p className="text-sm text-muted-foreground line-clamp-2">
														{item.description}
													</p>
												)}
											</div>
										</div>

										{/* Item Metadata */}
										{renderMetadata(item)}

										{/* Monetization Info Banner */}
										{item.monetization?.enabled && (
											<div className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-md border border-emerald-200 dark:border-emerald-800">
												<div className="flex items-start gap-2">
													<MonetizeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
													<div className="flex-1">
														<p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">
															Monetized{" "}
															{itemTypeName === "workflow"
																? "Workflow"
																: itemTypeName === "template"
																	? "Template"
																	: "Search"}
														</p>
														<p className="text-xs text-emerald-700 dark:text-emerald-300">
															{item.monetization.priceMultiplier}x multiplier •
															Publicly available in marketplace
														</p>
													</div>
												</div>
											</div>
										)}

										{/* Monetization Toggle */}
										<div className="mb-3 p-3 bg-accent/30 rounded-md border border-border">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2 flex-1">
													<MonetizeIcon className="h-4 w-4 text-muted-foreground" />
													<div className="flex-1">
														<div className="flex items-center gap-2">
															<Label
																htmlFor={`monetize-${item.id}`}
																className="text-sm font-medium cursor-pointer"
															>
																Monetization
															</Label>
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger>
																		<Info className="h-3 w-3 text-muted-foreground" />
																	</TooltipTrigger>
																	<TooltipContent className="max-w-xs">
																		{item.monetization ? (
																			<div className="text-xs space-y-1">
																				<p>
																					Toggle to enable/disable public
																					marketplace availability.
																				</p>
																				<p className="font-semibold">
																					Note: To change the price multiplier (
																					{item.monetization.priceMultiplier}x),
																					create a new {itemTypeName} with your
																					desired pricing.
																				</p>
																			</div>
																		) : (
																			<p className="text-xs">
																				Toggle to enable/disable public
																				marketplace availability. You&apos;ll
																				need to set up monetization details
																				(pricing, terms) when enabling.
																			</p>
																		)}
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
														</div>
														<p className="text-xs text-muted-foreground">
															{item.monetization?.enabled
																? `Active at ${item.monetization.priceMultiplier}x ($${(item.monetization.priceMultiplier * 9.99).toFixed(2)}/use)`
																: item.monetization
																	? `Inactive (was ${item.monetization.priceMultiplier}x)`
																	: "Not configured"}
														</p>
													</div>
												</div>
												<Switch
													id={`monetize-${item.id}`}
													checked={item.monetization?.enabled || false}
													onCheckedChange={() => onToggleMonetization(item.id)}
													disabled={!item.monetization}
												/>
											</div>
											{!item.monetization && (
												<p className="text-xs text-muted-foreground mt-2 italic">
													💡 Generate a new {itemTypeName} with monetization
													enabled to activate this feature
												</p>
											)}
										</div>

										{/* Fit Score */}
										<div className="mb-3 p-3 bg-background/50 rounded-md border border-border/50">
											<div className="flex items-center justify-between mb-2">
												<span className="text-xs font-medium">
													{fitScoreLabel}
												</span>
												<Select
													value={fitTimeframe}
													onValueChange={setFitTimeframe}
												>
													<SelectTrigger className="h-6 text-xs w-[100px]">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="today">Today</SelectItem>
														<SelectItem value="7days">7 Days</SelectItem>
														<SelectItem value="week">Week</SelectItem>
														<SelectItem value="month">Month</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div className="flex items-center gap-2">
												<div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
													<div
														className={cn(
															"h-full transition-all rounded-full",
															fitScore >= 80
																? "bg-gradient-to-r from-green-500 to-emerald-500"
																: fitScore >= 60
																	? "bg-gradient-to-r from-blue-500 to-cyan-500"
																	: "bg-gradient-to-r from-amber-500 to-yellow-500",
														)}
														style={{ width: `${fitScore}%` }}
													/>
												</div>
												<span className="text-xs font-semibold w-10 text-right">
													{fitScore}%
												</span>
											</div>
										</div>

										{/* AI Prompt Preview */}
										{renderAIPrompt && renderAIPrompt(item, itemType)}

										{/* Actions */}
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => onSelect(item)}
												className={cn(
													"flex-1 px-4 py-2 rounded-md font-medium text-sm transition-colors",
													itemType === "ai-generated" &&
														"bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
													itemType === "ai-suggested" &&
														"bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white",
													itemType === "manual" &&
														"bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white",
												)}
											>
												{selectButtonLabel}
											</button>

											{/* Priority Button (if provided) */}
											{onSetPriority && (
												<button
													type="button"
													onClick={() => onSetPriority(item.id)}
													className="px-3 py-2 rounded-md border border-border hover:bg-accent transition-colors"
													title={
														item.priority
															? "Remove from favorites"
															: "Add to favorites"
													}
												>
													{item.priority ? (
														<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
													) : (
														<StarOff className="h-4 w-4" />
													)}
												</button>
											)}

											{/* Extra Actions (if provided) */}
											{renderExtraActions && renderExtraActions(item)}

											{/* Delete Button */}
											{deleteConfirmId === item.id ? (
												<>
													<button
														type="button"
														onClick={() => {
															onDelete(item.id);
															setDeleteConfirmId(null);
														}}
														className="px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
													>
														Confirm
													</button>
													<button
														type="button"
														onClick={() => setDeleteConfirmId(null)}
														className="px-3 py-2 rounded-md border border-border hover:bg-accent transition-colors text-sm"
													>
														Cancel
													</button>
												</>
											) : (
												<button
													type="button"
													onClick={() => setDeleteConfirmId(item.id)}
													className="px-3 py-2 rounded-md border border-border hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600 transition-colors text-sm font-medium"
												>
													Delete
												</button>
											)}
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
