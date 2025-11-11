import type { SavedCampaignTemplate } from "@/types/userProfile";
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
	Phone,
	MessageSquare,
	Mail,
	Users,
	DollarSign,
	Calendar,
	Globe,
	DollarSign as MonetizeIcon,
	Info,
} from "lucide-react";
import type { FC } from "react";
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
import { toast } from "sonner";

type SavedCampaignTemplatesModalProps = {
	open: boolean;
	onClose: () => void;
	templates: SavedCampaignTemplate[];
	onDelete: (id: string) => void;
	onSelect: (template: SavedCampaignTemplate) => void;
	onSetPriority: (id: string) => void;
	onToggleMonetization: (id: string) => void;
};

type TemplateType = "ai-generated" | "ai-suggested" | "manual";

const SavedCampaignTemplatesModal: FC<SavedCampaignTemplatesModalProps> = ({
	open,
	onClose,
	templates,
	onDelete,
	onSelect,
	onSetPriority,
	onToggleMonetization,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState<
		"all" | "ai" | "ai-suggested" | "manual"
	>("all");
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
	const [editingMultiplierId, setEditingMultiplierId] = useState<string | null>(
		null,
	);
	const [tempMultiplier, setTempMultiplier] = useState<number>(1);

	// Determine template type
	const getTemplateType = (template: SavedCampaignTemplate): TemplateType => {
		const config = template.campaignConfig;

		// AI-Generated: Created entirely by AI
		if (config?.generatedByAI === true && config?.aiPrompt) {
			return "ai-generated";
		}

		// AI-Suggested: Has AI assistance but user configured
		if (config?.aiSuggested === true || config?.aiPrompt) {
			return "ai-suggested";
		}

		// Manual: Created entirely by user
		return "manual";
	};

	// Check if a template was updated
	const wasUpdated = (template: SavedCampaignTemplate): boolean => {
		if (!template.updatedAt || !template.createdAt) return false;
		const created = new Date(template.createdAt).getTime();
		const updated = new Date(template.updatedAt).getTime();
		return updated - created > 1000; // More than 1 second difference
	};

	// Calculate template fit score (mock - would be real analytics in production)
	const calculateFitScore = (
		template: SavedCampaignTemplate,
		timeframe: string,
	): number => {
		const created = new Date(template.createdAt).getTime();
		const now = Date.now();
		const ageInDays = (now - created) / (1000 * 60 * 60 * 24);

		// Base score
		let score = 75;

		// Adjust based on type
		const type = getTemplateType(template);
		if (type === "ai-generated") score += 15;
		if (type === "ai-suggested") score += 10;

		// Adjust based on timeframe (templates perform better over time)
		if (timeframe === "today") score -= 10;
		if (timeframe === "7days" && ageInDays >= 7) score += 5;
		if (timeframe === "month" && ageInDays >= 30) score += 10;

		// Adjust if priority
		if (template.priority) score += 5;

		// Adjust based on usage
		if (template.useCount && template.useCount > 5) score += 10;

		// Cap at 100
		return Math.min(100, Math.max(0, score));
	};

	// Filter templates by query and type
	const filteredTemplates = useMemo(() => {
		let filtered = templates;

		// Filter by type
		if (filterType === "ai") {
			filtered = filtered.filter((t) => getTemplateType(t) === "ai-generated");
		} else if (filterType === "ai-suggested") {
			filtered = filtered.filter((t) => getTemplateType(t) === "ai-suggested");
		} else if (filterType === "manual") {
			filtered = filtered.filter((t) => getTemplateType(t) === "manual");
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(t) =>
					t.name.toLowerCase().includes(query) ||
					t.description?.toLowerCase().includes(query) ||
					t.campaignConfig.channels.some((ch) =>
						ch.toLowerCase().includes(query),
					),
			);
		}

		// Sort by priority, then by date
		return filtered.sort((a, b) => {
			if (a.priority && !b.priority) return -1;
			if (!a.priority && b.priority) return 1;
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	}, [templates, filterType, searchQuery]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
			<div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col">
				{/* Header */}
				<div className="sticky top-0 z-10 bg-card border-b border-border p-4 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">Saved Campaign Templates</h2>
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
							placeholder="Search templates..."
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
							All ({templates.length})
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

				{/* Templates List */}
				<div className="flex-1 overflow-y-auto p-4">
					{filteredTemplates.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p className="text-lg font-medium">No templates found</p>
							<p className="text-sm">
								{searchQuery
									? "Try a different search"
									: "Create your first campaign template"}
							</p>
						</div>
					) : (
						<ul className="space-y-3">
							{filteredTemplates.map((template) => {
								const templateType = getTemplateType(template);
								const isUpdated = wasUpdated(template);
								const [fitTimeframe, setFitTimeframe] = useState("week");
								const fitScore = calculateFitScore(template, fitTimeframe);

								return (
									<li
										key={template.id}
										className={cn(
											"border rounded-lg p-4 transition-all hover:shadow-md",
											templateType === "ai-generated" &&
												"bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
											templateType === "ai-suggested" &&
												"bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
											templateType === "manual" &&
												"bg-slate-50/50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-800",
										)}
									>
										{/* Template Header */}
										<div className="flex items-start justify-between gap-3 mb-3">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1 flex-wrap">
													<h3 className="font-semibold text-base truncate">
														{template.name}
													</h3>
													{/* Type Badge */}
													{templateType === "ai-generated" && (
														<Badge
															variant="default"
															className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
														>
															<Sparkles className="h-3 w-3" />
															AI
														</Badge>
													)}
													{templateType === "ai-suggested" && (
														<Badge
															variant="default"
															className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1"
														>
															<Lightbulb className="h-3 w-3" />
															Suggested
														</Badge>
													)}
													{templateType === "manual" && (
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
													{template.priority && (
														<Badge
															variant="default"
															className="bg-yellow-500 hover:bg-yellow-600 text-white"
														>
															<Star className="h-3 w-3 fill-current" />
														</Badge>
													)}
												</div>
												{template.description && (
													<p className="text-sm text-muted-foreground line-clamp-2">
														{template.description}
													</p>
												)}
											</div>
										</div>

										{/* Campaign Metadata */}
										<div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground">
											{/* Channels */}
											<div className="flex items-center gap-1">
												{template.campaignConfig.channels.includes("call") && (
													<Phone className="h-3 w-3 text-blue-500" />
												)}
												{template.campaignConfig.channels.includes("sms") && (
													<MessageSquare className="h-3 w-3 text-green-500" />
												)}
												{template.campaignConfig.channels.includes("email") && (
													<Mail className="h-3 w-3 text-purple-500" />
												)}
												{template.campaignConfig.channels.includes(
													"social",
												) && <Users className="h-3 w-3 text-amber-500" />}
												<span>
													{template.campaignConfig.channels.length} Channel
													{template.campaignConfig.channels.length !== 1
														? "s"
														: ""}
												</span>
											</div>
											{/* Budget */}
											{template.campaignConfig.budget && (
												<div className="flex items-center gap-1">
													<DollarSign className="h-3 w-3" />
													<span>
														${template.campaignConfig.budget.toLocaleString()}
													</span>
												</div>
											)}
											{/* Monetization Status */}
											{template.monetization?.enabled && (
												<div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
													<Globe className="h-3 w-3" />
													<span>
														Public ($
														{(
															template.monetization.priceMultiplier * 9.99
														).toFixed(2)}
														/use)
													</span>
												</div>
											)}
											{/* Created */}
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												<span>
													{new Date(template.createdAt).toLocaleDateString()}
												</span>
											</div>
											{/* Use Count */}
											{template.useCount && template.useCount > 0 && (
												<div className="flex items-center gap-1">
													<TrendingUp className="h-3 w-3" />
													<span>Used {template.useCount}x</span>
												</div>
											)}
										</div>

										{/* Monetization Info Banner */}
										{template.monetization?.enabled && (
											<div className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-md border border-emerald-200 dark:border-emerald-800">
												<div className="flex items-start gap-2">
													<MonetizeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
													<div className="flex-1">
														<p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">
															Monetized Template
														</p>
														<p className="text-xs text-emerald-700 dark:text-emerald-300">
															{template.monetization.priceMultiplier}x
															multiplier • Publicly available in marketplace
														</p>
													</div>
												</div>
											</div>
										)}

										{/* Monetization Toggle */}
										<div className="mb-3 p-3 bg-accent/30 rounded-md border border-border">
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center gap-2 flex-1">
													<MonetizeIcon className="h-4 w-4 text-muted-foreground" />
													<div className="flex-1">
														<div className="flex items-center gap-2">
															<Label
																htmlFor={`monetize-${template.id}`}
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
																		<p className="text-xs">
																			Toggle to enable/disable public
																			marketplace availability. Adjust the
																			multiplier (1-5x) to set your pricing.
																		</p>
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
														</div>
														<p className="text-xs text-muted-foreground">
															{template.monetization?.enabled
																? `Active at ${template.monetization.priceMultiplier}x ($${(template.monetization.priceMultiplier * 9.99).toFixed(2)}/use)`
																: template.monetization
																	? `Inactive (was ${template.monetization.priceMultiplier}x)`
																	: "Not configured"}
														</p>
													</div>
												</div>
												<Switch
													id={`monetize-${template.id}`}
													checked={template.monetization?.enabled || false}
													onCheckedChange={() =>
														onToggleMonetization(template.id)
													}
													disabled={!template.monetization}
												/>
											</div>

											{/* Price Multiplier Input (when enabled) */}
											{template.monetization?.enabled && (
												<div className="flex items-center gap-3 pt-3 border-t border-border">
													<Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
														Price Multiplier:
													</Label>
													<div className="flex items-center gap-2 flex-1">
														<input
															type="range"
															min="1"
															max="5"
															step="0.5"
															value={template.monetization.priceMultiplier}
															onChange={(e) => {
																const value = Number.parseFloat(e.target.value);
																// TODO: Update the multiplier in store
																toast.success(`Updated to ${value}x`, {
																	description: `Price: $${(value * 9.99).toFixed(2)}/use`,
																});
															}}
															className="flex-1 h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
														/>
														<div className="flex items-center gap-2">
															<input
																type="number"
																min="1"
																max="5"
																step="0.5"
																value={template.monetization.priceMultiplier}
																onChange={(e) => {
																	const value = Number.parseFloat(
																		e.target.value,
																	);
																	if (value >= 1 && value <= 5) {
																		// TODO: Update the multiplier in store
																		toast.success(`Updated to ${value}x`, {
																			description: `Price: $${(value * 9.99).toFixed(2)}/use`,
																		});
																	}
																}}
																className="w-16 px-2 py-1 text-center text-sm font-semibold bg-background border border-border rounded-md"
															/>
															<span className="text-xs font-semibold text-muted-foreground">
																x
															</span>
															<span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
																$
																{(
																	template.monetization.priceMultiplier * 9.99
																).toFixed(2)}
															</span>
														</div>
													</div>
												</div>
											)}

											{!template.monetization && (
												<p className="text-xs text-muted-foreground mt-2 italic">
													💡 Generate a new campaign with monetization enabled
													to activate this feature
												</p>
											)}
										</div>

										{/* Template Fit Score */}
										<div className="mb-3 p-3 bg-background/50 rounded-md border border-border/50">
											<div className="flex items-center justify-between mb-2">
												<span className="text-xs font-medium">
													Campaign Fit Score
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

										{/* AI Prompt Preview (for AI-generated templates) */}
										{(templateType === "ai-generated" ||
											templateType === "ai-suggested") &&
											template.campaignConfig.aiPrompt && (
												<div className="mb-3 p-3 bg-background/50 rounded-md border border-border/50">
													<div className="flex items-center gap-2 mb-2">
														{templateType === "ai-generated" ? (
															<>
																<Sparkles className="h-3 w-3 text-blue-500" />
																<span className="text-xs font-semibold">
																	AI Generated Prompt
																</span>
															</>
														) : (
															<>
																<Lightbulb className="h-3 w-3 text-amber-500" />
																<span className="text-xs font-semibold">
																	AI Suggestion
																</span>
															</>
														)}
													</div>
													<pre className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3 font-mono">
														{template.campaignConfig.aiPrompt}
													</pre>
												</div>
											)}

										{/* Actions */}
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => onSelect(template)}
												className={cn(
													"flex-1 px-4 py-2 rounded-md font-medium text-sm transition-colors",
													templateType === "ai-generated" &&
														"bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
													templateType === "ai-suggested" &&
														"bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white",
													templateType === "manual" &&
														"bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white",
												)}
											>
												Use Template
											</button>
											<button
												type="button"
												onClick={() => onSetPriority(template.id)}
												className="px-3 py-2 rounded-md border border-border hover:bg-accent transition-colors"
												title={
													template.priority
														? "Remove from favorites"
														: "Add to favorites"
												}
											>
												{template.priority ? (
													<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
												) : (
													<StarOff className="h-4 w-4" />
												)}
											</button>
											{deleteConfirmId === template.id ? (
												<>
													<button
														type="button"
														onClick={() => {
															onDelete(template.id);
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
													onClick={() => setDeleteConfirmId(template.id)}
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
};

export default SavedCampaignTemplatesModal;
