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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
	Boxes,
	Shapes,
	Layers,
} from "lucide-react";
import { useUserPromptsStore } from "@/lib/stores/user/prompts";
import { useState, useMemo, useCallback, memo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/_utils";

type ProviderKey = "chatgpt" | "claude" | "gemini";

const svgClass = "h-4 w-4";

const ChatGPTLogo = ({
	className,
	...props
}: React.SVGProps<SVGSVGElement>) => (
	<svg
		viewBox="0 0 24 24"
		role="img"
		aria-hidden="true"
		className={cn(svgClass, className)}
		{...props}
	>
		<path
			fill="currentColor"
			d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
		/>
	</svg>
);

const ClaudeLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
	<svg
		viewBox="0 0 24 24"
		role="img"
		aria-hidden="true"
		className={cn(svgClass, className)}
		{...props}
	>
		<path
			fill="currentColor"
			d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"
		/>
	</svg>
);

const GeminiLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
	<svg
		viewBox="0 0 24 24"
		role="img"
		aria-hidden="true"
		className={cn(svgClass, className)}
		{...props}
	>
		<path
			fill="currentColor"
			d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"
		/>
	</svg>
);

const providerLogos: Record<ProviderKey, typeof ChatGPTLogo> = {
	chatgpt: ChatGPTLogo,
	claude: ClaudeLogo,
	gemini: GeminiLogo,
};

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
	const [isMobileViewport, setIsMobileViewport] = useState(false);

	// Track viewport width to adjust popover portal usage on mobile (stacked dialog compatibility)
	useEffect(() => {
		if (typeof window === "undefined") return;
		const mediaQuery = window.matchMedia("(max-width: 768px)");
		const handleChange = (event: MediaQueryListEvent) => {
			setIsMobileViewport(event.matches);
		};

		setIsMobileViewport(mediaQuery.matches);

		if (typeof mediaQuery.addEventListener === "function") {
			mediaQuery.addEventListener("change", handleChange);
			return () => mediaQuery.removeEventListener("change", handleChange);
		}

		// Fallback for older browsers
		mediaQuery.addListener(handleChange);
		return () => mediaQuery.removeListener(handleChange);
	}, []);

	// Debounce search for performance (300ms delay)
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

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

	const getProviderColor = (
		provider: ProviderKey,
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

	const getProviderBrandIcon = (provider: ProviderKey) => {
		const Logo = providerLogos[provider];
		return <Logo />;
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

	const triggerButton = (
		<Button
			variant={variant}
			size={size}
			className={cn(
				"gap-2 bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 font-semibold shadow-md transition-all hover:from-secondary/95 hover:via-secondary/85 hover:to-secondary/75 hover:shadow-lg",
				className,
			)}
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
	);

	const headerBackground = isMobileViewport ? "bg-card" : "bg-popover";
	const scrollAreaClass = isMobileViewport
		? "flex-1 touch-pan-y overflow-y-auto p-3"
		: "max-h-[calc(70vh-120px)] touch-pan-y overflow-y-auto p-2 sm:max-h-[480px]";

	const templateListContent = (
		<>
			{/* Header - Sticky */}
			<div
				className={cn("sticky top-0 z-10 border-b p-4 pb-3", headerBackground)}
			>
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
			<div className={scrollAreaClass}>
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
											{/* Provider Chips - Responsive layout */}
											<div
												className={cn(
													"flex items-center",
													isMobileViewport
														? "mt-3 w-full flex-wrap justify-center gap-2"
														: "absolute top-1 right-1 justify-end gap-0.5 sm:top-2 sm:right-2 sm:gap-1",
												)}
											>
												{(["chatgpt", "claude", "gemini"] as ProviderKey[]).map(
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
																				{getProviderLabel(provider)} not enabled
																				<br />
																				<span className="text-[10px] text-muted-foreground">
																					Enable in settings
																				</span>
																			</span>
																		) : !status.working ? (
																			<span>
																				{getProviderLabel(provider)} connection
																				issue
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
																<span className="xs:inline hidden">Kestra</span>
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
		</>
	);

	if (isMobileViewport) {
		return (
			<Sheet open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
				<SheetTrigger asChild>{triggerButton}</SheetTrigger>
				<SheetContent
					side="bottom"
					className="flex h-[90vh] max-h-[90vh] flex-col gap-0 overflow-hidden rounded-t-3xl border-none p-0 pt-2"
				>
					{templateListContent}
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
			<PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
			<PopoverContent
				className="max-h-[70vh] w-[calc(100vw-2rem)] p-0 sm:max-h-[600px] sm:w-[480px]"
				sideOffset={5}
				align="center"
			>
				{templateListContent}
			</PopoverContent>
		</Popover>
	);
}
