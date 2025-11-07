import type { SavedSearch } from "@/types/userProfile";
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
} from "lucide-react";
import type { FC } from "react";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/_utils";

type SavedSearchModalProps = {
	open: boolean;
	onClose: () => void;
	savedSearches: SavedSearch[];
	onDelete: (id: string) => void;
	onSelect: (search: SavedSearch) => void;
	onSetPriority: (id: string) => void;
};

type SearchType = "ai-generated" | "ai-suggested" | "manual";

const SavedSearchModal: FC<SavedSearchModalProps> = ({
	open,
	onClose,
	savedSearches,
	onDelete,
	onSelect,
	onSetPriority,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState<
		"all" | "ai" | "ai-suggested" | "manual"
	>("all");

	// Determine search type
	const getSearchType = (search: SavedSearch): SearchType => {
		const criteria = search.searchCriteria as any;

		// AI-Generated: Created entirely by AI
		if (criteria?.generatedByAI === true && criteria?.aiPrompt) {
			return "ai-generated";
		}

		// AI-Suggested: Has AI assistance but user configured
		if (criteria?.aiSuggested === true || criteria?.aiPrompt) {
			return "ai-suggested";
		}

		// Manual: Created entirely by user
		return "manual";
	};

	// Check if a search was updated (updatedAt > createdAt by more than 1 second)
	const wasUpdated = (search: SavedSearch): boolean => {
		if (!search.updatedAt || !search.createdAt) return false;
		const created = new Date(search.createdAt).getTime();
		const updated = new Date(search.updatedAt).getTime();
		return updated - created > 1000; // More than 1 second difference
	};

	// Calculate search fit score (mock - would be real analytics in production)
	const calculateFitScore = (
		search: SavedSearch,
		timeframe: string,
	): number => {
		const criteria = search.searchCriteria as any;
		const created = new Date(search.createdAt).getTime();
		const now = Date.now();
		const ageInDays = (now - created) / (1000 * 60 * 60 * 24);

		// Base score
		let score = 75;

		// Adjust based on type
		const type = getSearchType(search);
		if (type === "ai-generated") score += 15;
		if (type === "ai-suggested") score += 10;

		// Adjust based on timeframe (searches perform better over time)
		if (timeframe === "today") score -= 10;
		if (timeframe === "7days" && ageInDays >= 7) score += 5;
		if (timeframe === "month" && ageInDays >= 30) score += 10;

		// Adjust if priority
		if (search.priority) score += 5;

		// Cap at 100
		return Math.min(100, Math.max(0, score));
	};

	// Filter searches by query and type
	const filteredSearches = useMemo(() => {
		let filtered = savedSearches;

		// Filter by type
		if (filterType === "ai") {
			filtered = filtered.filter((s) => getSearchType(s) === "ai-generated");
		} else if (filterType === "ai-suggested") {
			filtered = filtered.filter((s) => getSearchType(s) === "ai-suggested");
		} else if (filterType === "manual") {
			filtered = filtered.filter((s) => getSearchType(s) === "manual");
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(s) =>
					s.name.toLowerCase().includes(query) ||
					s.description?.toLowerCase().includes(query),
			);
		}

		return filtered;
	}, [savedSearches, filterType, searchQuery]);

	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="relative w-full max-w-2xl rounded-xl bg-card p-6 text-card-foreground shadow-lg">
				<button
					type="button"
					className="absolute top-3 right-3 text-muted-foreground hover:text-accent"
					onClick={onClose}
					aria-label="Close modal"
				>
					<X className="h-5 w-5" />
				</button>

				{/* Header */}
				<div className="mb-4 space-y-3">
					<h2 className="font-bold text-xl">Saved Searches</h2>

					{/* Search and Filter */}
					<div className="flex flex-col sm:flex-row gap-2">
						{/* Search Input */}
						<div className="relative flex-1">
							<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search by name or description..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 h-9"
							/>
						</div>

						{/* Type Filter */}
						<div className="flex gap-1 rounded-lg bg-muted p-1">
							<button
								type="button"
								className={cn(
									"px-3 py-1 rounded-md text-xs font-medium transition-colors",
									filterType === "all"
										? "bg-background shadow-sm"
										: "hover:bg-background/50",
								)}
								onClick={() => setFilterType("all")}
							>
								All ({savedSearches.length})
							</button>
							<button
								type="button"
								className={cn(
									"px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1",
									filterType === "ai"
										? "bg-background shadow-sm"
										: "hover:bg-background/50",
								)}
								onClick={() => setFilterType("ai")}
							>
								<Sparkles className="h-3 w-3" />
								AI (
								{
									savedSearches.filter(
										(s) => getSearchType(s) === "ai-generated",
									).length
								}
								)
							</button>
							<button
								type="button"
								className={cn(
									"px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1",
									filterType === "ai-suggested"
										? "bg-background shadow-sm"
										: "hover:bg-background/50",
								)}
								onClick={() => setFilterType("ai-suggested")}
							>
								<Lightbulb className="h-3 w-3" />
								Suggested (
								{
									savedSearches.filter(
										(s) => getSearchType(s) === "ai-suggested",
									).length
								}
								)
							</button>
							<button
								type="button"
								className={cn(
									"px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1",
									filterType === "manual"
										? "bg-background shadow-sm"
										: "hover:bg-background/50",
								)}
								onClick={() => setFilterType("manual")}
							>
								<User className="h-3 w-3" />
								Manual (
								{
									savedSearches.filter((s) => getSearchType(s) === "manual")
										.length
								}
								)
							</button>
						</div>
					</div>
				</div>
				{savedSearches.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						No saved searches yet.
					</div>
				) : filteredSearches.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<p>No searches found matching "{searchQuery}"</p>
						<button
							type="button"
							className="mt-2 text-primary text-sm hover:underline"
							onClick={() => {
								setSearchQuery("");
								setFilterType("all");
							}}
						>
							Clear filters
						</button>
					</div>
				) : (
					<ul className="max-h-96 space-y-3 overflow-y-auto pr-2">
						{filteredSearches.map((search) => {
							const searchType = getSearchType(search);
							const updated = wasUpdated(search);
							const criteria = search.searchCriteria as any;
							const [fitTimeframe, setFitTimeframe] = useState("7days");
							const fitScore = calculateFitScore(search, fitTimeframe);

							return (
								<li
									key={search.id}
									className={cn(
										"flex flex-col gap-3 rounded-lg border p-4 transition-all hover:shadow-md",
										searchType === "ai-generated"
											? "bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20"
											: searchType === "ai-suggested"
												? "bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20"
												: "bg-muted/50 border-border",
									)}
								>
									{/* Header Row */}
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1 flex-wrap">
												{/* Type Badge */}
												<Badge
													variant={
														searchType === "manual" ? "secondary" : "default"
													}
													className={cn(
														"text-[10px] px-1.5 py-0 h-5 font-bold",
														searchType === "ai-generated" &&
															"bg-gradient-to-r from-purple-500 to-blue-500 text-white",
														searchType === "ai-suggested" &&
															"bg-gradient-to-r from-amber-500 to-orange-500 text-white",
													)}
												>
													{searchType === "ai-generated" ? (
														<>
															<Sparkles className="h-3 w-3 mr-0.5" />
															AI
														</>
													) : searchType === "ai-suggested" ? (
														<>
															<Lightbulb className="h-3 w-3 mr-0.5" />
															AI SUGGESTED
														</>
													) : (
														<>
															<User className="h-3 w-3 mr-0.5" />
															MANUAL
														</>
													)}
												</Badge>

												{/* Updated Badge */}
												{updated && (
													<Badge
														variant="outline"
														className="text-[10px] px-1.5 py-0 h-5 font-semibold text-orange-600 dark:text-orange-400 border-orange-500/30"
													>
														<Clock className="h-2.5 w-2.5 mr-0.5" />
														UPDATED
													</Badge>
												)}

												{/* Priority Star */}
												<button
													type="button"
													className="group"
													title={
														search.priority
															? "Priority Search"
															: "Set as Priority"
													}
													onClick={() => onSetPriority(search.id)}
												>
													{search.priority ? (
														<Star className="fill-yellow-500 text-yellow-500 h-4 w-4" />
													) : (
														<StarOff className="text-muted-foreground group-hover:text-yellow-500 h-4 w-4" />
													)}
												</button>
											</div>

											{/* Name */}
											<h3 className="font-semibold text-foreground truncate">
												{search.name}
											</h3>

											{/* Description (if available) */}
											{search.description && (
												<p className="text-muted-foreground text-xs mt-1 line-clamp-2">
													{search.description}
												</p>
											)}
										</div>

										{/* Timestamp */}
										<div className="text-right shrink-0">
											<p className="text-muted-foreground text-[10px]">
												{updated ? "Updated" : "Created"}
											</p>
											<p className="text-foreground text-xs font-medium">
												{new Date(
													updated ? search.updatedAt : search.createdAt,
												).toLocaleDateString()}
											</p>
											<p className="text-muted-foreground text-[10px]">
												{new Date(
													updated ? search.updatedAt : search.createdAt,
												).toLocaleTimeString()}
											</p>
										</div>
									</div>

									{/* Search Fit Rating */}
									<div className="space-y-1.5">
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-2">
												<TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
												<span className="text-xs font-medium text-muted-foreground">
													Search Fit Score
												</span>
											</div>
											<Select
												value={fitTimeframe}
												onValueChange={setFitTimeframe}
											>
												<SelectTrigger className="h-6 w-24 text-[10px]">
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

										{/* Fit Score Bar */}
										<div className="flex items-center gap-2">
											<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
												<div
													className={cn(
														"h-full transition-all duration-300 rounded-full",
														fitScore >= 80
															? "bg-gradient-to-r from-green-500 to-emerald-500"
															: fitScore >= 60
																? "bg-gradient-to-r from-blue-500 to-cyan-500"
																: fitScore >= 40
																	? "bg-gradient-to-r from-amber-500 to-orange-500"
																	: "bg-gradient-to-r from-red-500 to-rose-500",
													)}
													style={{ width: `${fitScore}%` }}
												/>
											</div>
											<span
												className={cn(
													"text-xs font-bold tabular-nums min-w-[3ch]",
													fitScore >= 80
														? "text-green-600 dark:text-green-400"
														: fitScore >= 60
															? "text-blue-600 dark:text-blue-400"
															: fitScore >= 40
																? "text-amber-600 dark:text-amber-400"
																: "text-red-600 dark:text-red-400",
												)}
											>
												{fitScore}%
											</span>
										</div>
									</div>
									<div className="flex flex-wrap gap-2 rounded-lg bg-muted p-3 text-xs">
										{typeof search.searchCriteria.location === "string" && (
											<div className="rounded bg-accent/10 px-2 py-1 font-semibold text-accent-foreground">
												Location:{" "}
												<span className="font-normal">
													{search.searchCriteria.location}
												</span>
											</div>
										)}
										{typeof search.searchCriteria.baths === "string" && (
											<div className="rounded bg-primary/10 px-2 py-1 font-semibold text-primary-foreground">
												Baths:{" "}
												<span className="font-normal">
													{search.searchCriteria.baths}
												</span>
											</div>
										)}
										{typeof search.searchCriteria.beds === "string" && (
											<div className="rounded bg-green-500/10 px-2 py-1 font-semibold text-green-700">
												Beds:{" "}
												<span className="font-normal">
													{search.searchCriteria.beds}
												</span>
											</div>
										)}
										{typeof search.searchCriteria.propertyType === "string" && (
											<div className="rounded bg-purple-500/10 px-2 py-1 font-semibold text-purple-700">
												Type:{" "}
												<span className="font-normal">
													{search.searchCriteria.propertyType}
												</span>
											</div>
										)}
										{typeof search.searchCriteria.advanced === "object" &&
											search.searchCriteria.advanced !== null &&
											(() => {
												const adv = search.searchCriteria.advanced as Record<
													string,
													unknown
												>;
												return (
													<>
														{"mlsOnly" in adv &&
															typeof adv.mlsOnly === "boolean" && (
																<div className="rounded bg-muted px-2 py-1 font-semibold text-muted-foreground">
																	MLS Only:
																	<span className="font-normal">
																		{adv.mlsOnly ? "Yes" : "No"}
																	</span>
																</div>
															)}
														{"foreClosure" in adv &&
															typeof adv.foreClosure === "boolean" && (
																<div className="rounded bg-muted px-2 py-1 font-semibold text-muted-foreground">
																	Foreclosure:
																	<span className="font-normal">
																		{adv.foreClosure ? "Yes" : "No"}
																	</span>
																</div>
															)}
														{"extraPropertyData" in adv &&
															typeof adv.extraPropertyData === "boolean" && (
																<div className="rounded bg-muted px-2 py-1 font-semibold text-muted-foreground">
																	Extra Data:
																	<span className="font-normal">
																		{adv.extraPropertyData ? "Yes" : "No"}
																	</span>
																</div>
															)}
														{"excludePending" in adv &&
															typeof adv.excludePending === "boolean" && (
																<div className="rounded bg-muted px-2 py-1 font-semibold text-muted-foreground">
																	Exclude Pending:
																	<span className="font-normal">
																		{adv.excludePending ? "Yes" : "No"}
																	</span>
																</div>
															)}
													</>
												);
											})()}
									</div>
									{/* AI Prompt Preview (if AI-generated or suggested) */}
									{(searchType === "ai-generated" ||
										searchType === "ai-suggested") &&
										criteria?.aiPrompt && (
											<div
												className={cn(
													"rounded-md border p-2",
													searchType === "ai-generated"
														? "bg-purple-500/10 border-purple-500/20"
														: "bg-amber-500/10 border-amber-500/20",
												)}
											>
												<p
													className={cn(
														"text-[10px] font-semibold mb-1 flex items-center gap-1",
														searchType === "ai-generated"
															? "text-purple-700 dark:text-purple-300"
															: "text-amber-700 dark:text-amber-300",
													)}
												>
													{searchType === "ai-generated" ? (
														<Sparkles className="h-3 w-3" />
													) : (
														<Lightbulb className="h-3 w-3" />
													)}
													{searchType === "ai-generated"
														? "AI Generated Prompt:"
														: "AI Suggestion:"}
												</p>
												<p className="text-muted-foreground text-xs line-clamp-2 font-mono">
													{criteria.aiPrompt}
												</p>
											</div>
										)}

									{/* Action Buttons */}
									<div className="flex justify-end gap-2 pt-1">
										<button
											type="button"
											className={cn(
												"rounded px-4 py-1.5 text-xs font-medium transition-all hover:shadow-md",
												searchType === "ai-generated"
													? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
													: searchType === "ai-suggested"
														? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
														: "bg-primary text-primary-foreground hover:bg-primary/90",
											)}
											onClick={() => onSelect(search)}
										>
											Select
										</button>
										<button
											type="button"
											className="rounded bg-muted px-4 py-1.5 text-muted-foreground text-xs font-medium hover:bg-destructive hover:text-destructive-foreground transition-all"
											onClick={() => {
												if (
													confirm(
														`Are you sure you want to delete "${search.name}"?`,
													)
												) {
													onDelete(search.id);
												}
											}}
										>
											Delete
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
};

export default SavedSearchModal;
