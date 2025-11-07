"use client";

import type { SavedWorkflow } from "@/types/userProfile";
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
	Workflow,
	Calendar,
	Globe,
	DollarSign as MonetizeIcon,
	Info,
	ExternalLink,
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

type SavedWorkflowsModalProps = {
	open: boolean;
	onClose: () => void;
	workflows: SavedWorkflow[];
	onDelete: (id: string) => void;
	onSelect: (workflow: SavedWorkflow) => void;
	onSetPriority: (id: string) => void;
	onToggleMonetization: (id: string) => void;
	onReExport: (id: string, platform: "n8n" | "make" | "kestra") => void;
};

type WorkflowType = "ai-generated" | "ai-suggested" | "manual";

const SavedWorkflowsModal: FC<SavedWorkflowsModalProps> = ({
	open,
	onClose,
	workflows,
	onDelete,
	onSelect,
	onSetPriority,
	onToggleMonetization,
	onReExport,
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

	// Determine workflow type
	const getWorkflowType = (workflow: SavedWorkflow): WorkflowType => {
		// AI-Generated: Created entirely by AI
		if (workflow.generatedByAI === true && workflow.aiPrompt) {
			return "ai-generated";
		}

		// AI-Suggested: Has AI assistance but user configured
		if (workflow.aiPrompt) {
			return "ai-suggested";
		}

		// Manual: Created entirely by user
		return "manual";
	};

	// Check if a workflow was updated
	const wasUpdated = (workflow: SavedWorkflow): boolean => {
		if (!workflow.updatedAt || !workflow.createdAt) return false;
		const created = new Date(workflow.createdAt).getTime();
		const updated = new Date(workflow.updatedAt).getTime();
		return updated - created > 1000; // More than 1 second difference
	};

	// Calculate workflow fit score (mock - would be real analytics in production)
	const calculateFitScore = (
		workflow: SavedWorkflow,
		timeframe: string,
	): number => {
		const created = new Date(workflow.createdAt).getTime();
		const now = Date.now();
		const ageInDays = (now - created) / (1000 * 60 * 60 * 24);

		// Base score
		let score = 75;

		// Adjust based on type
		const type = getWorkflowType(workflow);
		if (type === "ai-generated") score += 15;
		if (type === "ai-suggested") score += 10;

		// Adjust based on timeframe (workflows perform better over time)
		if (timeframe === "today") score -= 10;
		if (timeframe === "7days" && ageInDays >= 7) score += 5;
		if (timeframe === "month" && ageInDays >= 30) score += 10;

		// Cap at 100
		return Math.min(100, Math.max(0, score));
	};

	// Platform icons
	const getPlatformIcon = (platform: "n8n" | "make" | "kestra") => {
		return <Workflow className="h-3 w-3" />;
	};

	// Platform colors
	const getPlatformColor = (platform: "n8n" | "make" | "kestra") => {
		switch (platform) {
			case "n8n":
				return "from-pink-500 to-rose-500";
			case "make":
				return "from-purple-500 to-blue-500";
			case "kestra":
				return "from-indigo-500 to-purple-500";
			default:
				return "from-gray-500 to-gray-600";
		}
	};

	// Filter workflows by query and type
	const filteredWorkflows = useMemo(() => {
		let filtered = workflows;

		// Filter by type
		if (filterType === "ai") {
			filtered = filtered.filter((w) => getWorkflowType(w) === "ai-generated");
		} else if (filterType === "ai-suggested") {
			filtered = filtered.filter((w) => getWorkflowType(w) === "ai-suggested");
		} else if (filterType === "manual") {
			filtered = filtered.filter((w) => getWorkflowType(w) === "manual");
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(w) =>
					w.name.toLowerCase().includes(query) ||
					w.description?.toLowerCase().includes(query) ||
					w.platform.toLowerCase().includes(query),
			);
		}

		// Sort by date (newest first)
		return filtered.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
	}, [workflows, filterType, searchQuery]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
			<div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
				{/* Header */}
				<div className="sticky top-0 z-10 space-y-4 border-border border-b bg-card p-4">
					<div className="flex items-center justify-between">
						<h2 className="flex items-center gap-2 font-semibold text-xl">
							<Workflow className="h-5 w-5 text-primary" />
							Saved Workflows
						</h2>
						<button
							type="button"
							onClick={onClose}
							className="rounded-md p-1 transition-colors hover:bg-accent"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Search Bar */}
					<div className="relative">
						<SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search workflows..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pr-9 pl-9"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="-translate-y-1/2 absolute top-1/2 right-3 rounded-sm p-0.5 hover:bg-accent"
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
								"rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
								filterType === "all"
									? "bg-primary text-primary-foreground"
									: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
							)}
						>
							All ({workflows.length})
						</button>
						<button
							type="button"
							onClick={() => setFilterType("ai")}
							className={cn(
								"flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
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
								"flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
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
								"flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
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

				{/* Workflows List */}
				<div className="flex-1 overflow-y-auto p-4">
					{filteredWorkflows.length === 0 ? (
						<div className="py-12 text-center text-muted-foreground">
							<Workflow className="mx-auto mb-4 h-12 w-12 opacity-50" />
							<p className="font-medium text-lg">No workflows found</p>
							<p className="text-sm">
								{searchQuery
									? "Try a different search"
									: "Create your first workflow"}
							</p>
						</div>
					) : (
						<ul className="space-y-3">
							{filteredWorkflows.map((workflow) => {
								const workflowType = getWorkflowType(workflow);
								const isUpdated = wasUpdated(workflow);
								const [fitTimeframe, setFitTimeframe] = useState("week");
								const fitScore = calculateFitScore(workflow, fitTimeframe);

								return (
									<li
										key={workflow.id}
										className={cn(
											"rounded-lg border p-4 transition-all hover:shadow-md",
											workflowType === "ai-generated" &&
												"border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
											workflowType === "ai-suggested" &&
												"border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20",
											workflowType === "manual" &&
												"border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20",
										)}
									>
										{/* Workflow Header */}
										<div className="mb-3 flex items-start justify-between gap-3">
											<div className="min-w-0 flex-1">
												<div className="mb-1 flex flex-wrap items-center gap-2">
													<h3 className="truncate font-semibold text-base">
														{workflow.name}
													</h3>
													{/* Type Badge */}
													{workflowType === "ai-generated" && (
														<Badge
															variant="default"
															className="flex items-center gap-1 bg-blue-500 text-white hover:bg-blue-600"
														>
															<Sparkles className="h-3 w-3" />
															AI
														</Badge>
													)}
													{workflowType === "ai-suggested" && (
														<Badge
															variant="default"
															className="flex items-center gap-1 bg-amber-500 text-white hover:bg-amber-600"
														>
															<Lightbulb className="h-3 w-3" />
															Suggested
														</Badge>
													)}
													{workflowType === "manual" && (
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
												</div>
												{workflow.description && (
													<p className="line-clamp-2 text-muted-foreground text-sm">
														{workflow.description}
													</p>
												)}
											</div>
										</div>

										{/* Workflow Metadata */}
										<div className="mb-3 flex flex-wrap gap-3 text-muted-foreground text-xs">
											{/* Platform Badge */}
											<div className="flex items-center gap-1">
												<div
													className={cn(
														"flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br text-white",
														getPlatformColor(workflow.platform),
													)}
												>
													{getPlatformIcon(workflow.platform)}
												</div>
												<span className="font-medium capitalize">
													{workflow.platform}
												</span>
											</div>
											{/* Monetization Status */}
											{workflow.monetization?.enabled && (
												<div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
													<Globe className="h-3 w-3" />
													<span>
														Public ($
														{(
															workflow.monetization.priceMultiplier * 9.99
														).toFixed(2)}
														/use)
													</span>
												</div>
											)}
											{/* Created */}
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												<span>
													{new Date(workflow.createdAt).toLocaleDateString()}
												</span>
											</div>
										</div>

										{/* Monetization Info Banner */}
										{workflow.monetization?.enabled && (
											<div className="mb-3 rounded-md border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-3 dark:border-emerald-800 dark:from-emerald-950/20 dark:to-green-950/20">
												<div className="flex items-start gap-2">
													<MonetizeIcon className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
													<div className="flex-1">
														<p className="font-semibold text-emerald-900 text-xs dark:text-emerald-100">
															Monetized Workflow
														</p>
														<p className="text-emerald-700 text-xs dark:text-emerald-300">
															{workflow.monetization.priceMultiplier}x
															multiplier • Publicly available in marketplace
														</p>
													</div>
												</div>
											</div>
										)}

										{/* Monetization Toggle */}
										<div className="mb-3 rounded-md border border-border bg-accent/30 p-3">
											<div className="mb-3 flex items-center justify-between">
												<div className="flex flex-1 items-center gap-2">
													<MonetizeIcon className="h-4 w-4 text-muted-foreground" />
													<div className="flex-1">
														<div className="flex items-center gap-2">
															<Label
																htmlFor={`monetize-${workflow.id}`}
																className="cursor-pointer font-medium text-sm"
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
														<p className="text-muted-foreground text-xs">
															{workflow.monetization?.enabled
																? `Active at ${workflow.monetization.priceMultiplier}x ($${(workflow.monetization.priceMultiplier * 9.99).toFixed(2)}/use)`
																: workflow.monetization
																	? `Inactive (was ${workflow.monetization.priceMultiplier}x)`
																	: "Not configured"}
														</p>
													</div>
												</div>
												<Switch
													id={`monetize-${workflow.id}`}
													checked={workflow.monetization?.enabled || false}
													onCheckedChange={() =>
														onToggleMonetization(workflow.id)
													}
													disabled={!workflow.monetization}
												/>
											</div>

											{/* Price Multiplier Input (when enabled) */}
											{workflow.monetization?.enabled && (
												<div className="flex items-center gap-3 border-border border-t pt-3">
													<Label className="whitespace-nowrap font-medium text-muted-foreground text-xs">
														Price Multiplier:
													</Label>
													<div className="flex flex-1 items-center gap-2">
														<input
															type="range"
															min="1"
															max="5"
															step="0.5"
															value={workflow.monetization.priceMultiplier}
															onChange={(e) => {
																const value = Number.parseFloat(e.target.value);
																// TODO: Update the multiplier in store
																toast.success(`Updated to ${value}x`, {
																	description: `Price: $${(value * 9.99).toFixed(2)}/use`,
																});
															}}
															className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-primary/20 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
														/>
														<div className="flex items-center gap-2">
															<input
																type="number"
																min="1"
																max="5"
																step="0.5"
																value={workflow.monetization.priceMultiplier}
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
																className="w-16 rounded-md border border-border bg-background px-2 py-1 text-center font-semibold text-sm"
															/>
															<span className="font-semibold text-muted-foreground text-xs">
																x
															</span>
															<span className="whitespace-nowrap font-medium text-emerald-600 text-xs dark:text-emerald-400">
																$
																{(
																	workflow.monetization.priceMultiplier * 9.99
																).toFixed(2)}
															</span>
														</div>
													</div>
												</div>
											)}

											{!workflow.monetization && (
												<p className="mt-2 text-muted-foreground text-xs italic">
													💡 Generate a new workflow with monetization enabled
													to activate this feature
												</p>
											)}
										</div>

										{/* Workflow Fit Score */}
										<div className="mb-3 rounded-md border border-border/50 bg-background/50 p-3">
											<div className="mb-2 flex items-center justify-between">
												<span className="font-medium text-xs">
													Workflow Fit Score
												</span>
												<Select
													value={fitTimeframe}
													onValueChange={setFitTimeframe}
												>
													<SelectTrigger className="h-6 w-[100px] text-xs">
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
												<div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
													<div
														className={cn(
															"h-full rounded-full transition-all",
															fitScore >= 80
																? "bg-gradient-to-r from-green-500 to-emerald-500"
																: fitScore >= 60
																	? "bg-gradient-to-r from-blue-500 to-cyan-500"
																	: "bg-gradient-to-r from-amber-500 to-yellow-500",
														)}
														style={{ width: `${fitScore}%` }}
													/>
												</div>
												<span className="w-10 text-right font-semibold text-xs">
													{fitScore}%
												</span>
											</div>
										</div>

										{/* AI Prompt Preview */}
										{(workflowType === "ai-generated" ||
											workflowType === "ai-suggested") &&
											workflow.aiPrompt && (
												<div className="mb-3 rounded-md border border-border/50 bg-background/50 p-3">
													<div className="mb-2 flex items-center gap-2">
														{workflowType === "ai-generated" ? (
															<>
																<Sparkles className="h-3 w-3 text-blue-500" />
																<span className="font-semibold text-xs">
																	AI Generated Prompt
																</span>
															</>
														) : (
															<>
																<Lightbulb className="h-3 w-3 text-amber-500" />
																<span className="font-semibold text-xs">
																	AI Suggestion
																</span>
															</>
														)}
													</div>
													<pre className="line-clamp-3 whitespace-pre-wrap font-mono text-muted-foreground text-xs">
														{workflow.aiPrompt}
													</pre>
												</div>
											)}

										{/* Actions */}
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => onSelect(workflow)}
												className={cn(
													"flex-1 rounded-md px-4 py-2 font-medium text-sm transition-colors",
													workflowType === "ai-generated" &&
														"bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
													workflowType === "ai-suggested" &&
														"bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700",
													workflowType === "manual" &&
														"bg-gradient-to-r from-slate-500 to-slate-600 text-white hover:from-slate-600 hover:to-slate-700",
												)}
											>
												Use Workflow
											</button>
											<button
												type="button"
												onClick={() =>
													onReExport(workflow.id, workflow.platform)
												}
												className="rounded-md border border-border px-3 py-2 transition-colors hover:bg-accent"
												title="Re-export workflow"
											>
												<ExternalLink className="h-4 w-4" />
											</button>
											{deleteConfirmId === workflow.id ? (
												<>
													<button
														type="button"
														onClick={() => {
															onDelete(workflow.id);
															setDeleteConfirmId(null);
														}}
														className="rounded-md bg-red-500 px-3 py-2 font-medium text-sm text-white transition-colors hover:bg-red-600"
													>
														Confirm
													</button>
													<button
														type="button"
														onClick={() => setDeleteConfirmId(null)}
														className="rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-accent"
													>
														Cancel
													</button>
												</>
											) : (
												<button
													type="button"
													onClick={() => setDeleteConfirmId(workflow.id)}
													className="rounded-md border border-border px-3 py-2 font-medium text-sm transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-800 dark:hover:bg-red-950/20"
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

export default SavedWorkflowsModal;
