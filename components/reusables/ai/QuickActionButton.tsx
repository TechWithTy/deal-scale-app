/**
 * Quick Action Button
 * Highlighted button that opens a menu of quick action templates
 * Clicking an option copies the example prompt to clipboard
 */

"use client";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Copy,
	Sparkles,
	Zap,
	Search,
	Megaphone,
	X,
	Workflow,
	GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo } from "react";
import type { QuickActionTemplate } from "./QuickActionTemplates";

interface QuickActionButtonProps {
	templates: QuickActionTemplate[];
	onTemplateSelect?: (template: QuickActionTemplate) => void;
	variant?: "default" | "outline" | "secondary";
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
		| "analytics"
		| "kestra";
	// Filter to only show specific categories
	filterCategories?: Array<
		| "search"
		| "campaign"
		| "workflow"
		| "audience_search"
		| "outreach"
		| "enrichment"
		| "analytics"
		| "kestra"
	>;
}

export function QuickActionButton({
	templates,
	onTemplateSelect,
	variant = "default",
	size = "default",
	className = "",
	prioritizeCategory,
	filterCategories,
}: QuickActionButtonProps) {
	const [searchQuery, setSearchQuery] = useState("");

	// Filter by category first if specified
	const categoryFilteredTemplates = useMemo(() => {
		if (!filterCategories || filterCategories.length === 0) return templates;
		return templates.filter((t) => filterCategories.includes(t.category));
	}, [templates, filterCategories]);

	// Sort by priority category
	const sortedTemplates = useMemo(() => {
		if (!prioritizeCategory) return categoryFilteredTemplates;

		return [...categoryFilteredTemplates].sort((a, b) => {
			if (
				a.category === prioritizeCategory &&
				b.category !== prioritizeCategory
			)
				return -1;
			if (
				a.category !== prioritizeCategory &&
				b.category === prioritizeCategory
			)
				return 1;
			return 0;
		});
	}, [categoryFilteredTemplates, prioritizeCategory]);

	// Filter templates based on search query
	const filteredTemplates = useMemo(() => {
		if (!searchQuery.trim()) return sortedTemplates;

		const query = searchQuery.toLowerCase();
		return sortedTemplates.filter(
			(t) =>
				t.title.toLowerCase().includes(query) ||
				t.description.toLowerCase().includes(query) ||
				t.tags.some((tag) => tag.toLowerCase().includes(query)) ||
				t.prompt.toLowerCase().includes(query),
		);
	}, [sortedTemplates, searchQuery]);

	const handleCopyTemplate = async (
		template: QuickActionTemplate,
		e: React.MouseEvent,
	) => {
		e.stopPropagation();

		try {
			// First, attempt to copy
			await navigator.clipboard.writeText(template.prompt);

			// Only show success toast if copy succeeds
			const categoryEmoji =
				template.category === "search"
					? "🔍"
					: template.category === "campaign"
						? "🚀"
						: template.category === "workflow"
							? "🔄"
							: template.category === "kestra"
								? "⚡"
								: "✨";

			const categoryLabel =
				template.category === "search"
					? "Search"
					: template.category === "campaign"
						? "Campaign"
						: template.category === "workflow"
							? "Workflow"
							: template.category === "kestra"
								? "Kestra"
								: "Template";

			// Wait a tiny bit to ensure clipboard write completes
			await new Promise((resolve) => setTimeout(resolve, 50));

			toast.success("Copied to Clipboard!", {
				description: `${categoryEmoji} ${categoryLabel}: ${template.title || "Untitled"}`,
				duration: 3500,
			});

			onTemplateSelect?.(template);
		} catch (error) {
			// Only show error if copy actually failed
			console.error("Clipboard copy error:", error);
			toast.error("Copy Failed", {
				description: "Check browser permissions",
				duration: 3000,
			});
		}
	};

	// Group filtered templates by category
	const groupedTemplates = filteredTemplates.reduce(
		(acc, template) => {
			if (!acc[template.category]) {
				acc[template.category] = [];
			}
			acc[template.category].push(template);
			return acc;
		},
		{} as Record<string, QuickActionTemplate[]>,
	);

	const getCategoryConfig = (category: string) => {
		switch (category) {
			case "search":
				return {
					label: "Search Creation",
					icon: <Search className="h-4 w-4" />,
					emoji: "🔍",
					color: "text-blue-600 dark:text-blue-400",
					bgColor: "bg-blue-500/15",
					borderColor: "border-l-4 border-blue-500",
				};
			case "campaign":
				return {
					label: "Campaign Creation",
					icon: <Megaphone className="h-4 w-4" />,
					emoji: "🚀",
					color: "text-green-600 dark:text-green-400",
					bgColor: "bg-green-500/15",
					borderColor: "border-l-4 border-green-500",
				};
			case "workflow":
				return {
					label: "Workflow & Automation",
					icon: <Workflow className="h-4 w-4" />,
					emoji: "🔄",
					color: "text-indigo-600 dark:text-indigo-400",
					bgColor: "bg-indigo-500/15",
					borderColor: "border-l-4 border-indigo-500",
				};
			case "kestra":
				return {
					label: "Kestra Workflows",
					icon: <GitBranch className="h-4 w-4" />,
					emoji: "⚡",
					color: "text-violet-600 dark:text-violet-400",
					bgColor: "bg-violet-500/15",
					borderColor: "border-l-4 border-violet-500",
				};
			default:
				return {
					label: category,
					icon: <Sparkles className="h-4 w-4" />,
					emoji: "•",
					color: "text-muted-foreground",
					bgColor: "bg-muted/10",
					borderColor: "border-l-4 border-muted",
				};
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={variant}
					size={size}
					className={`gap-2 ${className} bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/95 hover:via-primary/85 hover:to-primary/75 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all animate-pulse hover:animate-none`}
					title={`${templates.length} quick action templates - built-in examples to get started`}
				>
					<Sparkles className="h-4 w-4 shrink-0" />
					<span className="truncate">Quick Actions</span>
					<Badge
						variant="secondary"
						className="ml-1 bg-primary-foreground/20 text-primary-foreground text-[10px] px-1.5 py-0 font-bold"
						title="Built-in quick start templates"
					>
						{templates.length}
					</Badge>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[calc(100vw-2rem)] sm:w-96 p-0"
				sideOffset={5}
				align="center"
			>
				{/* Scrollable container */}
				<div className="max-h-[70vh] sm:max-h-[500px] overflow-y-auto">
					{/* Sticky Header with Search */}
					<div className="sticky top-0 bg-popover z-10 px-4 pt-4 pb-3 border-b">
						<div className="flex items-center gap-2 pb-2">
							<Sparkles className="h-4 w-4 text-primary" />
							<span className="font-semibold">Example Prompts</span>
							<Badge variant="outline" className="ml-auto text-[10px]">
								Click to Copy
							</Badge>
						</div>
						{/* Search Input */}
						<div className="relative mt-2">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search prompts..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 pr-8 h-9 text-sm"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-sm transition-colors"
								>
									<X className="h-3.5 w-3.5 text-muted-foreground" />
								</button>
							)}
						</div>
					</div>

					{/* Template Groups */}
					<div className="p-2">
						{Object.keys(groupedTemplates).length === 0 ? (
							<div className="py-8 text-center">
								<p className="text-sm text-muted-foreground">
									No prompts found matching "{searchQuery}"
								</p>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setSearchQuery("")}
									className="mt-2"
								>
									Clear search
								</Button>
							</div>
						) : (
							Object.entries(groupedTemplates).map(
								([category, categoryTemplates], idx) => {
									const categoryConfig = getCategoryConfig(category);
									return (
										<div key={category} className="mb-2">
											{/* Category Header with Strong Visual Differentiation */}
											<div
												className={`px-3 py-2.5 mb-2 rounded-lg ${categoryConfig.bgColor} ${categoryConfig.borderColor} shadow-sm`}
											>
												<div
													className={`text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${categoryConfig.color}`}
												>
													<span className="shrink-0">
														{categoryConfig.icon}
													</span>
													<span>{categoryConfig.label}</span>
													<Badge
														variant="secondary"
														className={`ml-auto text-[10px] px-2 py-0.5 font-bold ${categoryConfig.color}`}
													>
														{categoryTemplates.length}
													</Badge>
												</div>
											</div>

											{/* Templates in this category */}
											<div className="space-y-1 touch-pan-y">
												{categoryTemplates.map((template) => {
													const isMaster =
														(template.title?.startsWith("🌟") ||
															template.tags?.includes("featured")) ??
														false;
													const categoryColor =
														category === "search"
															? "blue"
															: category === "campaign"
																? "green"
																: category === "workflow"
																	? "indigo"
																	: category === "kestra"
																		? "violet"
																		: "gray";

													return (
														<button
															key={template.id}
															type="button"
															className={`w-full flex flex-col items-start gap-1.5 py-3 px-3 cursor-pointer rounded-md group transition-all text-left border ${
																isMaster
																	? `ring-2 ring-${categoryColor}-500/50 shadow-md bg-${categoryColor}-500/5`
																	: "border-transparent"
															} ${
																category === "search"
																	? "hover:bg-blue-500/10 hover:border-blue-500/30"
																	: category === "campaign"
																		? "hover:bg-green-500/10 hover:border-green-500/30"
																		: category === "workflow"
																			? "hover:bg-indigo-500/10 hover:border-indigo-500/30"
																			: category === "kestra"
																				? "hover:bg-violet-500/10 hover:border-violet-500/30"
																				: "hover:bg-muted/50"
															}`}
															onClick={(e) => handleCopyTemplate(template, e)}
														>
															<div className="flex items-center justify-between w-full gap-2">
																<div className="flex items-center gap-2">
																	<span className="text-lg shrink-0">
																		{categoryConfig.emoji}
																	</span>
																	<span className="font-semibold text-sm">
																		{template.title}
																	</span>
																	{/* Master badge */}
																	{isMaster && (
																		<Badge
																			variant="outline"
																			className={`text-[9px] px-1.5 py-0 h-4 font-bold animate-pulse ${categoryConfig.color} ${categoryConfig.bgColor}`}
																		>
																			MASTER
																		</Badge>
																	)}
																	{/* Category indicator badge */}
																	<Badge
																		variant="outline"
																		className={`text-[9px] px-1.5 py-0 h-4 font-bold ${categoryConfig.color} ${categoryConfig.bgColor}`}
																	>
																		{category === "search"
																			? "SEARCH"
																			: category === "campaign"
																				? "CAMPAIGN"
																				: category === "workflow"
																					? "WORKFLOW"
																					: category === "kestra"
																						? "KESTRA"
																						: category.toUpperCase()}
																	</Badge>
																</div>
																<div className="flex items-center gap-1 shrink-0">
																	<Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
																</div>
															</div>
															<p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pl-7">
																{template.description}
															</p>
															<div className="flex flex-wrap gap-1 mt-0.5 pl-7">
																{template.tags.map((tag) => (
																	<Badge
																		key={tag}
																		variant="outline"
																		className="text-[9px] px-1.5 py-0 h-4"
																	>
																		{tag}
																	</Badge>
																))}
															</div>
														</button>
													);
												})}
											</div>

											{/* Separator between categories */}
											{idx < Object.keys(groupedTemplates).length - 1 && (
												<Separator className="my-3" />
											)}
										</div>
									);
								},
							)
						)}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
