/**
 * Prompt Templates Button
 * Displays user prompt templates in a popover
 */

"use client";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	BookTemplate,
	Search,
	Sparkles,
	Copy,
	Check,
	Workflow,
	Bot,
	ExternalLink,
	CheckCircle2,
	XCircle,
	AlertCircle,
	MessageSquare,
	Zap,
	Star,
	Boxes,
	Shapes,
	Layers,
} from "lucide-react";
import { useUserPromptsStore } from "@/lib/stores/user/prompts";
import { useState, useMemo, useCallback, memo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { FixedSizeList as VirtualList } from "react-window";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface PromptTemplatesButtonProps {
	onTemplateSelect: (content: string) => void;
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg";
	className?: string;
	// Context-aware prioritization
	prioritizeCategory?:
		| "search"
		| "campaign"
		| "workflow"
		| "audience_search"
		| "outreach"
		| "enrichment"
		| "analytics";
	// Filter to only show specific categories
	filterCategories?: Array<
		| "search"
		| "campaign"
		| "workflow"
		| "audience_search"
		| "outreach"
		| "enrichment"
		| "analytics"
	>;
	// Context type for dynamic tooltip
	contextType?: "workflow" | "campaign" | "search";
}

export function PromptTemplatesButton({
	onTemplateSelect,
	variant = "default",
	size = "sm",
	className = "",
	prioritizeCategory,
	filterCategories,
	contextType = "workflow",
}: PromptTemplatesButtonProps) {
	const templates = useUserPromptsStore((state) => state.templates);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
		new Set(),
	);

	// Debounce search for performance (300ms delay)
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Reset visible categories when popover opens
	useEffect(() => {
		if (isPopoverOpen) {
			// Show prioritized category + first 2 others initially
			const initial = new Set(sortedCategories.slice(0, 3));
			setVisibleCategories(initial);
		} else {
			setVisibleCategories(new Set());
		}
	}, [isPopoverOpen]);

	// Provider status (in real app, this would come from settings/API)
	const [providerStatus] = useState({
		chatgpt: { enabled: true, working: true, url: "https://chat.openai.com" },
		claude: { enabled: true, working: true, url: "https://claude.ai" },
		gemini: {
			enabled: false,
			working: false,
			url: "https://gemini.google.com",
		},
	});

	// Filter templates by search ONLY (not by category - show all)
	// Using debounced search for performance
	const filteredTemplates = useMemo(() => {
		let filtered = templates;

		// Apply debounced search query only - always show all categories
		if (debouncedSearch) {
			const query = debouncedSearch.toLowerCase();
			filtered = filtered.filter(
				(t) =>
					t.name.toLowerCase().includes(query) ||
					t.description?.toLowerCase().includes(query) ||
					t.tags.some((tag) => tag.toLowerCase().includes(query)),
			);
		}

		return filtered;
	}, [templates, debouncedSearch]);

	// Group by category
	const templatesByCategory = useMemo(() => {
		const grouped: Record<string, typeof templates> = {};
		for (const template of filteredTemplates) {
			const cat = template.category;
			if (!grouped[cat]) grouped[cat] = [];
			grouped[cat].push(template);
		}
		return grouped;
	}, [filteredTemplates]);

	// Sort categories with prioritization
	const sortedCategories = useMemo(() => {
		const categories = Object.keys(templatesByCategory);

		if (!prioritizeCategory) return categories;

		// Sort to put prioritized category first
		return categories.sort((a, b) => {
			if (a === prioritizeCategory && b !== prioritizeCategory) return -1;
			if (a !== prioritizeCategory && b === prioritizeCategory) return 1;
			return 0;
		});
	}, [templatesByCategory, prioritizeCategory]);

	const handleTemplateSelect = async (template: (typeof templates)[0]) => {
		try {
			// Copy to clipboard
			await navigator.clipboard.writeText(template.content);

			// Apply to prompt field
			onTemplateSelect(template.content);

			// Visual feedback
			setCopiedId(template.id);
			setTimeout(() => setCopiedId(null), 2000);

			toast.success("Template Applied", {
				description: template.name,
				duration: 2000,
			});
		} catch (error) {
			toast.error("Failed to apply template", {
				duration: 2000,
			});
		}
	};

	const getCategoryConfig = (category: string) => {
		switch (category) {
			case "audience_search":
				return {
					label: "Audience Search",
					emoji: "🎯",
					color: "text-blue-600 dark:text-blue-400",
					bgColor: "bg-blue-500/10",
					borderColor: "border-l-blue-500",
				};
			case "campaign":
				return {
					label: "Campaign Creation",
					emoji: "🚀",
					color: "text-emerald-600 dark:text-emerald-400",
					bgColor: "bg-emerald-500/10",
					borderColor: "border-l-emerald-500",
				};
			case "outreach":
				return {
					label: "Outreach",
					emoji: "📢",
					color: "text-green-600 dark:text-green-400",
					bgColor: "bg-green-500/10",
					borderColor: "border-l-green-500",
				};
			case "enrichment":
				return {
					label: "Enrichment",
					emoji: "💎",
					color: "text-purple-600 dark:text-purple-400",
					bgColor: "bg-purple-500/10",
					borderColor: "border-l-purple-500",
				};
			case "analytics":
				return {
					label: "Analytics",
					emoji: "📊",
					color: "text-orange-600 dark:text-orange-400",
					bgColor: "bg-orange-500/10",
					borderColor: "border-l-orange-500",
				};
			case "workflow":
				return {
					label: "Workflow & Automation",
					emoji: "🔄",
					color: "text-indigo-600 dark:text-indigo-400",
					bgColor: "bg-indigo-500/10",
					borderColor: "border-l-indigo-500",
				};
			default:
				return {
					label: "Custom",
					emoji: "✨",
					color: "text-gray-600 dark:text-gray-400",
					bgColor: "bg-gray-500/10",
					borderColor: "border-l-gray-500",
				};
		}
	};

	const getProviderIcon = (
		provider: "chatgpt" | "claude" | "gemini",
		status: { enabled: boolean; working: boolean },
	) => {
		if (!status.enabled) {
			return <XCircle className="h-3 w-3" />;
		}
		if (!status.working) {
			return <AlertCircle className="h-3 w-3" />;
		}
		return <CheckCircle2 className="h-3 w-3" />;
	};

	const getProviderColor = (
		provider: "chatgpt" | "claude" | "gemini",
		status: { enabled: boolean; working: boolean },
	) => {
		if (!status.enabled) {
			return "bg-gray-500/10 text-gray-500 border-gray-500/30 cursor-not-allowed";
		}
		if (!status.working) {
			return "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20";
		}

		// Enabled and working - platform-specific colors
		switch (provider) {
			case "chatgpt":
				return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20";
			case "claude":
				return "bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20";
			case "gemini":
				return "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20";
		}
	};

	const getProviderLabel = (provider: "chatgpt" | "claude" | "gemini") => {
		switch (provider) {
			case "chatgpt":
				return "ChatGPT";
			case "claude":
				return "Claude";
			case "gemini":
				return "Gemini";
		}
	};

	const getProviderBrandIcon = (provider: "chatgpt" | "claude" | "gemini") => {
		switch (provider) {
			case "chatgpt":
				return <MessageSquare className="h-3 w-3" />; // Chat bubble for ChatGPT
			case "claude":
				return <Zap className="h-3 w-3" />; // Lightning bolt for Claude (fast AI)
			case "gemini":
				return <Star className="h-3 w-3 fill-current" />; // Star for Gemini (Google's branding)
		}
	};

	const handleProviderClick = async (
		provider: "chatgpt" | "claude" | "gemini",
		status: { enabled: boolean; working: boolean; url: string },
		promptContent: string,
	) => {
		if (!status.enabled) {
			toast.error(`${getProviderLabel(provider)} not enabled`, {
				description: "Enable this provider in settings",
			});
			return;
		}

		if (!status.working) {
			toast.warning(`${getProviderLabel(provider)} connection issue`, {
				description: "Check your API key in settings",
			});
			return;
		}

		// First, copy prompt to clipboard
		try {
			await navigator.clipboard.writeText(promptContent);
			toast.success("Prompt copied to clipboard!", {
				description: `Opening ${getProviderLabel(provider)}...`,
			});
		} catch (error) {
			console.error("Failed to copy prompt:", error);
			toast.warning("Failed to copy prompt", {
				description: `Opening ${getProviderLabel(provider)} anyway`,
			});
		}

		// Then open provider URL in new tab
		window.open(status.url, "_blank", "noopener,noreferrer");
	};

	return (
		<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={variant}
					size={size}
					className={`gap-2 ${className} bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 font-semibold shadow-md transition-all hover:from-secondary/95 hover:via-secondary/85 hover:to-secondary/75 hover:shadow-lg`}
					title={`${templates.length} prompt templates in your library${prioritizeCategory ? ` - ${prioritizeCategory} shown first` : ""}`}
				>
					<BookTemplate className="h-4 w-4 shrink-0" />
					<span className="truncate">Prompt Library</span>
					<Badge
						variant="secondary"
						className="ml-1 bg-secondary-foreground/20 px-1.5 py-0 font-bold text-[10px] text-secondary-foreground"
						title={`${templates.length} total templates${prioritizeCategory ? ` (${prioritizeCategory} category first)` : ""}`}
					>
						{templates.length}
					</Badge>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="max-h-[70vh] w-[calc(100vw-2rem)] p-0 sm:max-h-[600px] sm:w-[480px]"
				sideOffset={5}
				align="center"
			>
				{/* Header - Sticky */}
				<div className="sticky top-0 z-10 border-b bg-popover p-4 pb-3">
					<div className="mb-3 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<BookTemplate className="h-5 w-5 text-primary" />
							<h3 className="font-semibold text-sm">
								Prompt Library
								{prioritizeCategory && (
									<span className="ml-2 font-normal text-muted-foreground text-xs">
										({prioritizeCategory} first)
									</span>
								)}
							</h3>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										{/* biome-ignore lint/nursery/useSortedClasses: Complex gradient and hover states */}
										<div className="group/bot flex h-6 w-6 cursor-help items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/30 transition-all duration-300 hover:scale-110 hover:from-primary/30 hover:to-primary/20 hover:ring-primary/50 hover:shadow-lg hover:shadow-primary/20 dark:from-primary/30 dark:to-primary/20 dark:ring-primary/40 dark:hover:from-primary/40 dark:hover:to-primary/30">
											<Bot className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover/bot:scale-110 dark:text-primary" />
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<div className="max-w-[200px] space-y-1 text-center">
											<p className="font-semibold text-xs">
												{contextType === "workflow"
													? "AI-powered workflow templates"
													: contextType === "campaign"
														? "AI-powered campaign templates"
														: "AI-powered search templates"}
											</p>
											<p className="text-muted-foreground text-xs">
												Use with ChatGPT, Claude, or Gemini
											</p>
											<p className="flex items-center justify-center gap-1 border-border border-t pt-1 text-muted-foreground text-xs">
												<span>💡</span>
												<code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground">
													{"{{chips}}"}
												</code>
												<span>need DealScale connection</span>
											</p>
										</div>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						<Badge variant="secondary" className="text-xs">
							{templates.length}
							{searchQuery && ` (${filteredTemplates.length} matches)`}
						</Badge>
					</div>

					{/* Search Input */}
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-3.5 w-3.5 text-muted-foreground" />
						<Input
							placeholder="Search templates..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-9 pr-8 pl-9 text-sm"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground hover:text-foreground"
							>
								×
							</button>
						)}
					</div>
				</div>

				{/* Template List - Scrollable */}
				<div className="max-h-[calc(70vh-120px)] touch-pan-y overflow-y-auto p-2 sm:max-h-[480px]">
					{sortedCategories.length === 0 ? (
						<div className="p-8 text-center text-muted-foreground text-sm">
							No templates found
						</div>
					) : (
						sortedCategories.map((category) => {
							const categoryTemplates = templatesByCategory[category];
							const config = getCategoryConfig(category);

							return (
								<div key={category} className="mb-3">
									{/* Category Header */}
									<div className="flex items-center gap-2 px-2 py-1.5">
										<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
											{config.emoji} {config.label}
										</span>
										<Separator className="flex-1" />
									</div>

									{/* Templates in Category */}
									{categoryTemplates.map((template) => {
										const isMaster =
											template.tags.includes("master") ||
											template.tags.includes("featured");
										const isN8n = template.tags.includes("n8n");
										const isMake = template.tags.includes("make");
										const isKestra = template.tags.includes("kestra");

										return (
											<button
												key={template.id}
												type="button"
												onClick={() => handleTemplateSelect(template)}
												className={`relative w-full rounded-lg border-l-4 p-2.5 text-left sm:p-3 ${config.borderColor} ${config.bgColor} group mb-2 transition-all hover:bg-accent/50 active:scale-[0.98] ${
													isMaster ? "shadow-lg ring-2 ring-primary/50" : ""
												}`}
											>
												{/* Provider Chips - Responsive Top Right */}
												<div className="absolute top-1 right-1 flex items-center gap-0.5 sm:top-2 sm:right-2 sm:gap-1">
													{(["chatgpt", "claude", "gemini"] as const).map(
														(provider) => {
															const status = providerStatus[provider];
															return (
																<TooltipProvider key={provider}>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<button
																				type="button"
																				onClick={(e) => {
																					e.stopPropagation();
																					handleProviderClick(
																						provider,
																						status,
																						template.content,
																					);
																				}}
																				disabled={!status.enabled}
																				// Mobile: min-h-[44px] min-w-[44px] for touch target, p-2
																				// Desktop: p-1.5
																				className={`flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full p-1 transition-all sm:min-h-[28px] sm:min-w-[28px] sm:p-1.5 ${getProviderColor(provider, status)}`}
																			>
																				{getProviderBrandIcon(provider)}
																			</button>
																		</TooltipTrigger>
																		<TooltipContent
																			side="top"
																			className="text-xs"
																		>
																			{!status.enabled ? (
																				<span>
																					{getProviderLabel(provider)} not
																					enabled
																					<br />
																					<span className="text-[10px] text-muted-foreground">
																						Enable in settings
																					</span>
																				</span>
																			) : !status.working ? (
																				<span>
																					{getProviderLabel(provider)}{" "}
																					connection issue
																					<br />
																					<span className="text-[10px] text-muted-foreground">
																						Check API key
																					</span>
																				</span>
																			) : (
																				<span>
																					Open in {getProviderLabel(provider)}
																				</span>
																			)}
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															);
														},
													)}
												</div>

												<div className="mb-1.5 flex items-start justify-between gap-2 sm:gap-3">
													<div className="min-w-0 flex-1 pr-16 sm:pr-20">
														<div className="mb-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
															<h4
																className={`truncate font-semibold text-xs sm:text-sm ${config.color} ${isMaster ? "sm:text-base" : ""}`}
															>
																{template.name}
															</h4>
															{isMaster && (
																<Badge
																	variant="default"
																	className="h-3.5 animate-pulse bg-primary px-1.5 py-0 text-[8px] text-primary-foreground sm:h-4 sm:text-[9px]"
																>
																	MASTER
																</Badge>
															)}
															{isN8n && (
																<Badge
																	variant="default"
																	className="h-3.5 bg-gradient-to-r from-pink-500 to-rose-500 px-1.5 py-0 text-[8px] text-white sm:h-4 sm:text-[9px]"
																>
																	<Boxes className="mr-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5" />
																	<span className="xs:inline hidden">n8n</span>
																</Badge>
															)}
															{isMake && (
																<Badge
																	variant="default"
																	className="h-3.5 bg-gradient-to-r from-orange-500 to-amber-500 px-1.5 py-0 text-[8px] text-white sm:h-4 sm:text-[9px]"
																>
																	<Shapes className="mr-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5" />
																	<span className="xs:inline hidden">Make</span>
																</Badge>
															)}
															{isKestra && (
																<Badge
																	variant="default"
																	className="h-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 px-1.5 py-0 text-[8px] text-white sm:h-4 sm:text-[9px]"
																>
																	<Layers className="mr-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5" />
																	<span className="xs:inline hidden">
																		Kestra
																	</span>
																</Badge>
															)}
															{template.isBuiltIn &&
																!isMaster &&
																!isN8n &&
																!isMake &&
																!isKestra && (
																	<Badge
																		variant="outline"
																		className="h-3.5 px-1 py-0 text-[8px] sm:h-4 sm:text-[9px]"
																	>
																		Built-in
																	</Badge>
																)}
														</div>
														<p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed sm:text-xs">
															{template.description}
														</p>
													</div>
												</div>

												{/* Tags */}
												{template.tags.length > 0 && (
													<div className="mt-1.5 flex flex-wrap gap-1 sm:mt-2">
														{template.tags.slice(0, 3).map((tag) => (
															<Badge
																key={tag}
																variant="secondary"
																className="h-3.5 px-1.5 py-0 text-[8px] sm:h-4 sm:text-[9px]"
															>
																{tag}
															</Badge>
														))}
														{template.tags.length > 3 && (
															<Badge
																variant="secondary"
																className="h-3.5 px-1.5 py-0 text-[8px] sm:h-4 sm:text-[9px]"
															>
																+{template.tags.length - 3}
															</Badge>
														)}
													</div>
												)}

												{/* Copy Icon - Bottom Right on Hover */}
												<div className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
													{copiedId === template.id ? (
														<div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600/20">
															<Check className="h-4 w-4 text-green-600" />
														</div>
													) : (
														<div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/80 backdrop-blur-sm hover:bg-muted">
															<Copy className="h-3.5 w-3.5 text-muted-foreground" />
														</div>
													)}
												</div>
											</button>
										);
									})}
								</div>
							);
						})
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
