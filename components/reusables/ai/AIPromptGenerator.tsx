/**
 * AI Prompt Generator Component
 * Modular, reusable component for AI-powered generation with variables and tools
 */

"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Sparkles } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChipTextarea, type ChipItem } from "./ChipTextarea";
import { InsertableChips, type InsertableChip } from "./InsertableChips";
import type { ChipDefinition } from "./InlineChipEditor";
import {
	QuickActionTemplates,
	type QuickActionTemplate,
} from "./QuickActionTemplates";
import { QuickActionButton } from "./QuickActionButton";
import { PromptTemplatesButton } from "./PromptTemplatesButton";
import { AIChatButton } from "./AIChatButton";
import { CompactFileUpload } from "./CompactFileUpload";
import { VoiceInputButton } from "./VoiceInputButton";
import { VoiceInputPopover } from "./VoiceInputPopover";
import { FeatureGuard } from "@/components/access/FeatureGuard";
import { useFeatureAccessGuard } from "@/hooks/useFeatureAccessGuard";
import { Lock, Lightbulb } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PromptFlowchartPreview } from "./PromptFlowchartPreview";

export interface AIPromptField {
	id: string;
	label: string;
	placeholder?: string;
	helpText?: string;
	required?: boolean;
	type?: "text" | "textarea" | "select" | "number";
	options?: Array<{ label: string; value: string }>;
	defaultValue?: string;
}

export interface AIPromptGeneratorProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	description?: string;
	icon?: React.ReactNode;

	// Chips (variables, tools, agents, scripts, resources, and automations)
	variables?: ChipDefinition[];
	tools?: ChipDefinition[];
	agents?: ChipDefinition[];
	scripts?: ChipDefinition[];
	resources?: ChipDefinition[];
	automations?: ChipDefinition[];

	// Quick action templates
	quickActions?: QuickActionTemplate[];
	showQuickActions?: boolean;
	prioritizeCategory?:
		| "search"
		| "campaign"
		| "workflow"
		| "audience_search"
		| "outreach"
		| "enrichment"
		| "analytics";
	filterCategories?: Array<
		| "search"
		| "campaign"
		| "workflow"
		| "audience_search"
		| "outreach"
		| "enrichment"
		| "analytics"
	>;

	// User prompt templates (from store)
	showPromptTemplates?: boolean;
	promptTemplateCategory?: string;

	// Voice input
	showVoiceInput?: boolean;
	voiceInputMode?: "replace" | "append";
	voiceInputLanguage?: string;
	onVoiceTranscription?: (text: string) => void;

	// File attachments
	showFileUpload?: boolean;
	files?: Array<{
		id: string;
		file: File;
		name: string;
		size: number;
		type: string;
	}>;
	onFilesChange?: (
		files: Array<{
			id: string;
			file: File;
			name: string;
			size: number;
			type: string;
		}>,
	) => void;

	// Reference data (optional)
	showCampaignReference?: boolean;
	availableCampaigns?: Array<{ id: string; name: string }>;
	selectedCampaignId?: string;
	onCampaignSelect?: (campaignId: string) => void;

	// AI Learning toggle
	showAILearning?: boolean;
	aiLearningEnabled?: boolean;
	onAILearningChange?: (enabled: boolean) => void;

	// Main prompt field
	promptLabel?: string;
	promptPlaceholder?: string;
	promptValue: string;
	onPromptChange: (value: string) => void;

	// Optional title field
	showTitleField?: boolean;
	titleLabel?: string;
	titlePlaceholder?: string;
	titleValue?: string;
	onTitleChange?: (value: string) => void;

	// Additional custom fields
	customFields?: AIPromptField[];
	customFieldValues?: Record<string, any>;
	onCustomFieldChange?: (fieldId: string, value: any) => void;

	// Custom sections (for JSX/React nodes)
	customSections?: React.ReactNode[];

	// Generation
	onGenerate: (data: {
		title?: string;
		prompt: string;
		customFields?: Record<string, any>;
	}) => Promise<void>;
	generateButtonText?: string;
	cancelButtonText?: string;

	// Validation
	minPromptLength?: number;
	minTitleLength?: number;

	// UI
	maxHeight?: string;
	className?: string;
}

export function AIPromptGenerator({
	isOpen,
	onOpenChange,
	title = "AI Generator",
	description = "Describe what you want to generate and let AI help you",
	icon = <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />,
	variables = [],
	tools = [],
	agents = [],
	scripts = [],
	resources = [],
	automations = [],
	quickActions = [],
	showQuickActions = true,
	prioritizeCategory,
	filterCategories,
	showPromptTemplates = true,
	promptTemplateCategory,

	// Voice input
	showVoiceInput = true,
	voiceInputMode = "append",
	voiceInputLanguage = "en-US",
	onVoiceTranscription,

	showFileUpload = true,
	files = [],
	onFilesChange,
	showCampaignReference = false,
	availableCampaigns = [],
	selectedCampaignId,
	onCampaignSelect,
	showAILearning = true,
	aiLearningEnabled = true,
	onAILearningChange,
	promptLabel = "AI Prompt & Description",
	promptPlaceholder = "Describe what you want to generate...",
	promptValue,
	onPromptChange,
	showTitleField = true,
	titleLabel = "Title",
	titlePlaceholder = "Give it a name",
	titleValue = "",
	onTitleChange,
	customFields = [],
	customFieldValues = {},
	onCustomFieldChange,
	customSections = [],
	onGenerate,
	generateButtonText = "Generate with AI",
	cancelButtonText = "Cancel",
	minPromptLength = 10,
	minTitleLength = 3,
	maxHeight = "85vh",
	className = "",
}: AIPromptGeneratorProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const editorRef = useRef<HTMLDivElement>(null);

	// Combine all chips for the editor with full definition including type
	const allChipsWithType = useMemo(
		() => [
			...variables,
			...tools,
			...agents,
			...scripts,
			...resources,
			...automations,
		],
		[variables, tools, agents, scripts, resources, automations],
	);

	// Convert to simple ChipItem format for the textarea
	const allChips: ChipItem[] = useMemo(
		() =>
			allChipsWithType.map((chip) => ({
				key: chip.key,
				label: chip.label,
				description: chip.description,
			})),
		[allChipsWithType],
	);

	// Convert chips to insertable format
	const insertableVariables: InsertableChip[] = useMemo(
		() =>
			variables.map((v) => ({
				key: v.key,
				label: v.label,
				description: v.description,
				icon: v.icon,
			})),
		[variables],
	);

	const insertableTools: InsertableChip[] = useMemo(
		() =>
			tools.map((t) => ({
				key: t.key,
				label: t.label,
				description: t.description,
				icon: t.icon,
			})),
		[tools],
	);

	const insertableScripts: InsertableChip[] = useMemo(
		() =>
			scripts.map((s) => ({
				key: s.key,
				label: s.label,
				description: s.description,
				icon: s.icon,
			})),
		[scripts],
	);

	const insertableResources: InsertableChip[] = useMemo(
		() =>
			resources.map((r) => ({
				key: r.key,
				label: r.label,
				description: r.description,
				icon: r.icon,
			})),
		[resources],
	);

	const insertableAutomations: InsertableChip[] = useMemo(
		() =>
			automations.map((a) => ({
				key: a.key,
				label: a.label,
				description: a.description,
				icon: a.icon,
			})),
		[automations],
	);

	// Insert chip into prompt
	const insertChip = useCallback(
		(chipKey: string) => {
			const newValue = `${promptValue}{{${chipKey}}}`;
			onPromptChange(newValue);

			// Focus editor
			setTimeout(() => {
				if (editorRef.current) {
					editorRef.current.focus();
				}
			}, 0);
		},
		[promptValue, onPromptChange],
	);

	// Validate
	const validate = useCallback((): boolean => {
		const newErrors: Record<string, string> = {};

		if (showTitleField && titleValue && titleValue.length < minTitleLength) {
			newErrors.title = `Title must be at least ${minTitleLength} characters`;
		}

		if (promptValue.length < minPromptLength) {
			newErrors.prompt = `Description must be at least ${minPromptLength} characters`;
		}

		// Validate custom fields
		for (const field of customFields) {
			if (field.required && !customFieldValues?.[field.id]) {
				newErrors[field.id] = `${field.label} is required`;
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [
		showTitleField,
		titleValue,
		minTitleLength,
		promptValue,
		minPromptLength,
		customFields,
		customFieldValues,
	]);

	// Check if ready to generate and collect missing fields
	const { canGenerate, missingFields } = useMemo(() => {
		const missing: string[] = [];

		if (showTitleField && (!titleValue || titleValue.length < minTitleLength)) {
			missing.push(titleLabel || "Title");
		}
		if (promptValue.length < minPromptLength) {
			missing.push(promptLabel || "AI Prompt");
		}
		// Check required custom fields
		for (const field of customFields) {
			if (field.required && !customFieldValues?.[field.id]) {
				missing.push(field.label);
			}
		}

		return {
			canGenerate: missing.length === 0,
			missingFields: missing,
		};
	}, [
		showTitleField,
		titleValue,
		minTitleLength,
		titleLabel,
		promptValue,
		minPromptLength,
		promptLabel,
		customFields,
		customFieldValues,
	]);

	// Normalize prompt - remove spaces around variable names
	const normalizePrompt = (prompt: string): string => {
		return prompt.replace(/\{\{\s*(\w+)\s*\}\}/g, "{{$1}}");
	};

	// Check if user has access to AI agents (A2A Protocol)
	const { allowed: hasAgentAccess } = useFeatureAccessGuard("ai-agents", {
		fallbackTier: "starter",
	});

	// Detect if agent variables are used without access
	const detectUnauthorizedAgents = useCallback(
		(prompt: string): string[] => {
			if (hasAgentAccess || agents.length === 0) return [];

			const normalizedPrompt = normalizePrompt(prompt);
			const agentKeys = agents.map((a) => a.key);
			const usedAgents: string[] = [];

			// Match all {{variable}} patterns
			const variableRegex = /\{\{(\w+)\}\}/g;
			let match;

			while ((match = variableRegex.exec(normalizedPrompt)) !== null) {
				const varKey = match[1];
				// Check if this is an agent variable
				if (agentKeys.includes(varKey) && !usedAgents.includes(varKey)) {
					usedAgents.push(varKey);
				}
			}

			return usedAgents;
		},
		[hasAgentAccess, agents],
	);

	// Handle generate
	const handleGenerate = useCallback(async () => {
		if (!validate()) return;

		// Check for unauthorized agent usage
		const unauthorizedAgents = detectUnauthorizedAgents(promptValue);
		if (unauthorizedAgents.length > 0) {
			const agentNames = unauthorizedAgents
				.map((key) => agents.find((a) => a.key === key)?.label || key)
				.join(", ");

			toast.error("AI Agents Locked", {
				description: `You're using agent(s): ${agentNames}. Upgrade to Starter plan or higher to use A2A agents.`,
				duration: 5000,
				action: {
					label: "Upgrade",
					onClick: () => {
						window.location.href = "/pricing";
					},
				},
			});
			return;
		}

		setIsGenerating(true);
		try {
			// Normalize prompt before sending
			const normalizedPrompt = normalizePrompt(promptValue);

			await onGenerate({
				title: titleValue,
				prompt: normalizedPrompt,
				customFields: customFieldValues,
			});
		} finally {
			setIsGenerating(false);
		}
	}, [
		validate,
		onGenerate,
		titleValue,
		promptValue,
		customFieldValues,
		detectUnauthorizedAgents,
		agents,
	]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"max-w-2xl p-0 gap-0 flex flex-col h-[95vh] sm:h-auto",
					className,
				)}
				style={{ maxHeight }}
			>
				{/* Header - Fixed and Centered */}
				<DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6 pb-3 border-b shrink-0 text-center">
					<DialogTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
						{icon && <span className="shrink-0 text-primary">{icon}</span>}
						{title}
					</DialogTitle>
					{description && (
						<DialogDescription className="text-xs sm:text-sm mt-1 text-center">
							{description}
						</DialogDescription>
					)}
					{/* Action Buttons Row - Quick Actions + Prompt Templates */}
					<div className="mt-3 flex justify-center gap-2 flex-wrap">
						{/* Quick Action Button */}
						{showQuickActions && quickActions && quickActions.length > 0 && (
							<QuickActionButton
								templates={quickActions}
								onTemplateSelect={(template) => {
									onPromptChange(template.prompt);
									if (showTitleField && onTitleChange) {
										onTitleChange(template.title);
									}
									// Additional toast when using in modal - mobile optimized
									const isSearch = template.category === "search";
									toast.success("Template Applied", {
										description: `${isSearch ? "🔍 Search" : "🚀 Campaign"}: ${template.title}`,
										duration: 2500,
									});
								}}
								variant="default"
								size="sm"
								className="text-xs sm:text-sm"
								prioritizeCategory={prioritizeCategory}
								filterCategories={filterCategories}
							/>
						)}

						{/* Prompt Templates Button */}
						{showPromptTemplates && (
							<PromptTemplatesButton
								onTemplateSelect={onPromptChange}
								prioritizeCategory={prioritizeCategory}
								filterCategories={filterCategories}
								contextType={
									prioritizeCategory === "workflow" ||
									prioritizeCategory === "audience_search"
										? "workflow"
										: prioritizeCategory === "campaign"
											? "campaign"
											: prioritizeCategory === "search"
												? "search"
												: "workflow"
								}
							/>
						)}
					</div>
				</DialogHeader>

				{/* Scrollable Content */}
				<div className="overflow-y-auto flex-1 min-h-0 px-4 sm:px-6 py-4">
					<div className="space-y-3 sm:space-y-4 pb-4">
						{/* Title Field */}
						{showTitleField && (
							<div>
								<Label htmlFor="ai-gen-title" className="text-sm">
									{titleLabel}
								</Label>
								<Input
									id="ai-gen-title"
									placeholder={titlePlaceholder}
									className="mt-2 text-sm"
									value={titleValue}
									onChange={(e) => onTitleChange?.(e.target.value)}
								/>
								{errors.title && (
									<p className="mt-1 text-destructive text-xs">
										{errors.title}
									</p>
								)}
							</div>
						)}

						{/* Reference Campaign (Optional) */}
						{showCampaignReference &&
							availableCampaigns &&
							availableCampaigns.length > 0 && (
								<div>
									<Label htmlFor="reference-campaign" className="text-sm">
										Reference Campaign (Optional)
									</Label>
									<Select
										value={selectedCampaignId || "none"}
										onValueChange={(value) => {
											if (onCampaignSelect) {
												onCampaignSelect(value === "none" ? "" : value);
											}
										}}
										disabled={isGenerating}
									>
										<SelectTrigger className="mt-1.5">
											<SelectValue placeholder="None - Start Fresh" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">None - Start Fresh</SelectItem>
											{availableCampaigns.map((campaign) => (
												<SelectItem key={campaign.id} value={campaign.id}>
													{campaign.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="mt-1 text-muted-foreground text-xs">
										Optionally select a past campaign to learn from and build
										upon
									</p>
								</div>
							)}

						{/* Reference Lead List (Optional) - Extracted from custom fields */}
						{(() => {
							const leadListField = customFields.find(
								(f) => f.id === "referenceSeedList",
							);
							if (!leadListField || leadListField.type !== "select")
								return null;

							return (
								<div>
									<Label
										htmlFor={`custom-${leadListField.id}`}
										className="text-sm"
									>
										{leadListField.label}
										{leadListField.required && (
											<span className="text-destructive ml-1">*</span>
										)}
									</Label>
									<Select
										value={
											customFieldValues?.[leadListField.id] ||
											leadListField.defaultValue ||
											""
										}
										onValueChange={(value) => {
											if (onCustomFieldChange) {
												onCustomFieldChange(leadListField.id, value);
											}
										}}
										disabled={isGenerating}
									>
										<SelectTrigger className="mt-1.5">
											<SelectValue placeholder="None - Start Fresh" />
										</SelectTrigger>
										<SelectContent>
											{leadListField.options?.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{errors[leadListField.id] && (
										<p className="mt-1 text-destructive text-xs">
											{errors[leadListField.id]}
										</p>
									)}
									{leadListField.helpText && (
										<p className="mt-1 text-muted-foreground text-xs">
											{leadListField.helpText}
										</p>
									)}
								</div>
							);
						})()}

						{/* AI Learning Toggle */}
						{showAILearning && onAILearningChange && (
							<div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
								<div className="flex items-start gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
										<Lightbulb className="h-5 w-5 text-primary" />
									</div>
									<div className="flex-1 space-y-2">
										<div className="flex items-center justify-between gap-4">
											<div>
												<Label
													htmlFor="ai-learning"
													className="text-sm font-semibold text-foreground"
												>
													Platform Intelligence
												</Label>
												<p className="text-xs text-muted-foreground mt-0.5">
													Use your past campaigns, conversions, and responses to
													generate smarter recommendations
												</p>
											</div>
											<Switch
												id="ai-learning"
												checked={aiLearningEnabled}
												onCheckedChange={onAILearningChange}
												disabled={isGenerating}
											/>
										</div>
										{aiLearningEnabled && (
											<div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
												✓ AI will analyze your best-performing campaigns,
												high-converting leads, and successful outreach patterns
												to optimize this generation
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Custom Sections (JSX/React nodes) - After Platform Intelligence */}
						{customSections && customSections.length > 0 && (
							<div className="space-y-4">
								{customSections.map((section, idx) => (
									<div key={`custom-section-${idx}`}>{section}</div>
								))}
							</div>
						)}

						{/* Accordion for Variables, Tools, Scripts, Resources, and Automations */}
						{(variables.length > 0 ||
							tools.length > 0 ||
							scripts.length > 0 ||
							resources.length > 0 ||
							automations.length > 0) && (
							<Accordion
								type="multiple"
								defaultValue={["variables"]}
								className="w-full"
							>
								{/* Platform Variables */}
								{variables.length > 0 && (
									<AccordionItem value="variables">
										<AccordionTrigger className="text-sm hover:no-underline">
											<span className="flex items-center gap-2">
												<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
													<span className="text-[10px] font-bold">V</span>
												</span>
												<span className="font-semibold">
													Platform Variables
												</span>
												<span className="text-muted-foreground">
													({variables.length})
												</span>
											</span>
										</AccordionTrigger>
										<AccordionContent>
											<InsertableChips
												chips={insertableVariables}
												onChipClick={insertChip}
												helpText="Variables contain dynamic data from your platform"
												searchPlaceholder="Search variables..."
												emptyMessage="No variables found"
											/>
										</AccordionContent>
									</AccordionItem>
								)}

								{/* Tools & Functions */}
								{tools.length > 0 && (
									<AccordionItem value="tools">
										<AccordionTrigger className="text-sm hover:no-underline">
											<span className="flex items-center gap-2">
												<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
													<span className="text-[10px] font-bold">T</span>
												</span>
												<span className="font-semibold">Tools & Functions</span>
												<span className="text-muted-foreground">
													({tools.length})
												</span>
											</span>
										</AccordionTrigger>
										<AccordionContent>
											<InsertableChips
												chips={insertableTools}
												onChipClick={insertChip}
												helpText="Tools perform actions, functions fetch resources"
												searchPlaceholder="Search tools & functions..."
												emptyMessage="No tools found"
											/>
										</AccordionContent>
									</AccordionItem>
								)}

								{/* AI Agents (A2A Protocol) - Detection on usage */}
								{agents.length > 0 && (
									<AccordionItem value="agents">
										<AccordionTrigger className="text-sm hover:no-underline">
											<span className="flex items-center gap-2">
												<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400">
													<span className="text-[10px] font-bold">A</span>
												</span>
												<span className="font-semibold">AI Agents (A2A)</span>
												<span className="text-muted-foreground">
													({agents.length})
												</span>
											</span>
										</AccordionTrigger>
										<AccordionContent>
											<InsertableChips
												chips={agents.map((agent) => ({
													key: agent.key,
													label: agent.label,
													description: agent.description,
													icon: agent.icon,
													locked: !hasAgentAccess,
													lockedMessage: (
														<span className="flex items-center gap-1 text-xs">
															🔒 AI Agents require Starter+.{" "}
															<a
																href="https://dealscale.io/pricing?upgrade=starter&feature=ai-agents"
																target="_blank"
																rel="noopener noreferrer"
																className="font-semibold text-primary underline hover:text-primary/80"
																onClick={(e) => e.stopPropagation()}
															>
																Upgrade
															</a>
														</span>
													),
												}))}
												onChipClick={insertChip}
												helpText={
													hasAgentAccess ? (
														"A2A agents orchestrated by backend. Click to insert into your prompt."
													) : (
														<span className="flex items-center gap-1 text-xs">
															🔒 AI Agents require Starter+ plan.{" "}
															<a
																href="https://dealscale.io/pricing?upgrade=starter&feature=ai-agents"
																target="_blank"
																rel="noopener noreferrer"
																className="font-semibold text-primary underline hover:text-primary/80 transition-colors"
																onClick={(e) => {
																	e.stopPropagation();
																}}
															>
																Upgrade
															</a>{" "}
															to use in prompts.
														</span>
													)
												}
												searchPlaceholder="Search agents..."
												emptyMessage="No agents found"
											/>
										</AccordionContent>
									</AccordionItem>
								)}

								{/* Sales Scripts & Prompts */}
								{scripts.length > 0 && (
									<AccordionItem value="scripts">
										<AccordionTrigger className="text-sm hover:no-underline">
											<span className="flex items-center gap-2">
												<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
													<span className="text-[10px] font-bold">S</span>
												</span>
												<span className="font-semibold">
													Sales Scripts & Prompts
												</span>
												<span className="text-muted-foreground">
													({scripts.length})
												</span>
											</span>
										</AccordionTrigger>
										<AccordionContent>
											<InsertableChips
												chips={insertableScripts}
												onChipClick={insertChip}
												helpText="Pre-built sales scripts and messaging templates"
												searchPlaceholder="Search scripts..."
												emptyMessage="No scripts found"
											/>
										</AccordionContent>
									</AccordionItem>
								)}

								{/* Resources & Files */}
								{resources.length > 0 && (
									<AccordionItem value="resources">
										<AccordionTrigger className="text-sm hover:no-underline">
											<span className="flex items-center gap-2">
												<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
													<span className="text-[10px] font-bold">R</span>
												</span>
												<span className="font-semibold">Resources & Files</span>
												<span className="text-muted-foreground">
													({resources.length})
												</span>
											</span>
										</AccordionTrigger>
										<AccordionContent>
											<InsertableChips
												chips={insertableResources}
												onChipClick={insertChip}
												helpText="Reference knowledge base articles, documents, and files"
												searchPlaceholder="Search resources..."
												emptyMessage="No resources found"
											/>
										</AccordionContent>
									</AccordionItem>
								)}

								{/* Automations & Workflows */}
								{automations.length > 0 && (
									<AccordionItem value="automations">
										<AccordionTrigger className="text-sm hover:no-underline">
											<span className="flex items-center gap-2">
												<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
													<span className="text-[10px] font-bold">W</span>
												</span>
												<span className="font-semibold">
													Automations & Workflows
												</span>
												<span className="text-muted-foreground">
													({automations.length})
												</span>
											</span>
										</AccordionTrigger>
										<AccordionContent>
											<InsertableChips
												chips={insertableAutomations}
												onChipClick={insertChip}
												helpText="Trigger n8n/Make.com workflows and automation sequences"
												searchPlaceholder="Search automations..."
												emptyMessage="No automations found"
											/>
										</AccordionContent>
									</AccordionItem>
								)}
							</Accordion>
						)}

						{/* Prompt Editor */}
						<div>
							<div className="mb-2 flex items-center justify-between gap-2">
								<Label htmlFor="ai-gen-prompt" className="text-sm">
									{promptLabel}
								</Label>
								<div className="flex items-center gap-2">
									{/* Voice Input Popover with STT and AI Enhance */}
									{showVoiceInput && (
										<VoiceInputPopover
											promptValue={promptValue}
											onTranscription={(text, isEnhanced) => {
												if (voiceInputMode === "replace") {
													onPromptChange(text);
												} else {
													// Append mode - add space if there's existing content
													const separator = promptValue.trim() ? " " : "";
													onPromptChange(`${promptValue}${separator}${text}`);
												}
												// Call custom handler if provided
												if (onVoiceTranscription) {
													onVoiceTranscription(text);
												}
											}}
											mode={voiceInputMode}
											language={voiceInputLanguage}
											disabled={isGenerating}
											availableChips={allChipsWithType}
										/>
									)}
									<PromptFlowchartPreview
										promptValue={promptValue}
										disabled={!promptValue.trim()}
									/>
								</div>
							</div>
							<ChipTextarea
								id="ai-gen-prompt"
								label="" // Label is now rendered above
								value={promptValue}
								onChange={onPromptChange}
								placeholder={promptPlaceholder}
								availableChips={allChips}
								error={errors.prompt}
								helpText={
									<span className="text-xs">
										Use{" "}
										<a
											href="https://microsoft.github.io/poml"
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline font-semibold"
										>
											POML
										</a>{" "}
										markup with{" "}
										<a
											href="https://github.com/a2aproject/A2A"
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline font-semibold"
										>
											A2A agents
										</a>{" "}
										and{" "}
										<a
											href="https://modelcontextprotocol.io"
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline font-semibold"
										>
											MCP
										</a>{" "}
										tools. Variables:{" "}
										<code className="text-[10px] bg-muted px-1 py-0.5 rounded">{`{{ }}`}</code>
									</span>
								}
								rows={5}
								showChipsBelow={false}
							/>
							{/* Color-coded chips display */}
							{promptValue && (
								<ColorCodedChipsDisplay
									value={promptValue}
									chipDefinitions={allChipsWithType}
									agents={agents}
									hasAgentAccess={hasAgentAccess}
								/>
							)}
							{/* File Upload - Compact */}
							{showFileUpload && onFilesChange && (
								<div className="mt-3">
									<CompactFileUpload
										files={files}
										onChange={onFilesChange}
										maxFiles={5}
										maxSizeMB={10}
									/>
								</div>
							)}
						</div>

						{/* Custom Fields */}
						{customFields
							.filter((field) => field.id !== "referenceSeedList")
							.map((field) => (
								<div key={field.id}>
									<Label htmlFor={`custom-${field.id}`} className="text-sm">
										{field.label}
										{field.required && (
											<span className="text-destructive ml-1">*</span>
										)}
									</Label>
									{field.type === "select" ? (
										<select
											id={`custom-${field.id}`}
											value={
												customFieldValues?.[field.id] ||
												field.defaultValue ||
												""
											}
											onChange={(e) =>
												onCustomFieldChange?.(field.id, e.target.value)
											}
											className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										>
											{field.options?.map((opt) => (
												<option key={opt.value} value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
									) : field.type === "textarea" ? (
										<textarea
											id={`custom-${field.id}`}
											placeholder={field.placeholder}
											value={
												customFieldValues?.[field.id] ||
												field.defaultValue ||
												""
											}
											onChange={(e) =>
												onCustomFieldChange?.(field.id, e.target.value)
											}
											rows={3}
											className="mt-2 flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
										/>
									) : (
										<Input
											id={`custom-${field.id}`}
											type={field.type || "text"}
											placeholder={field.placeholder}
											value={
												customFieldValues?.[field.id] ||
												field.defaultValue ||
												""
											}
											onChange={(e) =>
												onCustomFieldChange?.(field.id, e.target.value)
											}
											className="mt-2 text-sm"
										/>
									)}
									{errors[field.id] && (
										<p className="mt-1 text-destructive text-xs">
											{errors[field.id]}
										</p>
									)}
									{field.helpText && (
										<p className="mt-1 text-muted-foreground text-xs">
											{field.helpText}
										</p>
									)}
								</div>
							))}

						{/* Context Indicator - Show specific missing fields */}
						{!canGenerate && missingFields.length > 0 && (
							<div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
								<p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
									<span className="shrink-0">💡</span>
									<span>
										<strong>Missing required fields:</strong>
										<span className="ml-1">
											{missingFields.map((field, idx) => (
												<span key={field}>
													<span className="font-semibold">{field}</span>
													{idx < missingFields.length - 1 && ", "}
												</span>
											))}
										</span>
									</span>
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Footer - Fixed, always visible with side-by-side buttons */}
				<div className="border-t px-4 py-3 sm:px-6 sm:py-4 bg-background shrink-0 safe-bottom">
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="h-11 sm:h-10 flex-1 text-sm font-medium sm:max-w-[120px]"
							disabled={isGenerating}
						>
							{cancelButtonText}
						</Button>
						<div className="flex flex-1 gap-2">
							{/* Generate Button - 50% width */}
							<div className="flex-1">
								<Button
									type="button"
									onClick={handleGenerate}
									disabled={!canGenerate || isGenerating}
									className="h-11 sm:h-10 w-full gap-2 text-sm font-medium"
								>
									{isGenerating ? (
										<>
											<Loader2 className="h-4 w-4 shrink-0 animate-spin" />
											<span className="truncate">Generating...</span>
										</>
									) : (
										<>
											<Sparkles className="h-4 w-4 shrink-0" />
											<span className="truncate">{generateButtonText}</span>
										</>
									)}
								</Button>
							</div>
							{/* Chat Button - 50% width, Tier Gated */}
							<div className="flex-1">
								<AIChatButton
									promptValue={promptValue}
									titleValue={titleValue}
									disabled={isGenerating}
								/>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function cn(...classes: (string | boolean | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

// Color-coded chips display component
function ColorCodedChipsDisplay({
	value,
	chipDefinitions,
	agents = [],
	hasAgentAccess = true,
}: {
	value: string;
	chipDefinitions: ChipDefinition[];
	agents?: ChipDefinition[];
	hasAgentAccess?: boolean;
}) {
	// Import useMemo from React is already available at file level
	const chips = useMemo(() => {
		const variableMap = new Map<
			string,
			{ count: number; def: ChipDefinition }
		>();
		// Match {{variable}} with optional spaces: {{ variable }}, {{variable}}, etc.
		const variableRegex = /\{\{\s*(\w+)\s*\}\}/g;
		let match;

		while ((match = variableRegex.exec(value)) !== null) {
			const varKey = match[1]; // Captured group is variable name without spaces

			// ONLY add if this variable exists in our chip definitions
			const chipDef = chipDefinitions.find((c) => c.key === varKey);
			if (!chipDef) continue; // Skip invalid variables entirely

			// Check if this is a locked agent
			const isAgent = chipDef.type === "agent";
			const isLocked = isAgent && !hasAgentAccess;

			if (!variableMap.has(varKey)) {
				variableMap.set(varKey, {
					count: 0,
					def: chipDef,
					isLocked,
				});
			}
			const entry = variableMap.get(varKey)!;
			entry.count++;
		}

		// Only return entries that have valid definitions
		return Array.from(variableMap.entries())
			.map(([key, { count, def, isLocked }]) => ({
				key,
				count,
				def,
				isLocked: isLocked || false,
			}))
			.filter((chip) => chip.def !== undefined);
	}, [value, chipDefinitions]);

	if (chips.length === 0) return null;

	return (
		<div className="mt-2">
			<p className="mb-2 text-muted-foreground text-xs">
				Context in your prompt:
			</p>
			<div className="overflow-x-auto">
				<div className="flex min-w-max flex-nowrap gap-2 rounded-lg border bg-muted/30 p-2 sm:flex-wrap sm:min-w-0">
					{chips.length === 0 ? (
						<p className="text-xs text-muted-foreground px-2 py-1">
							No valid variables detected
						</p>
					) : (
						chips.map(({ key, count, def, isLocked }) => {
							// All chips here are guaranteed to be valid
							const chipType = def.type;

							// Get inline styles for reliable color rendering - theme-aware
							// INCREASED opacity and border width for better visibility
							const getChipStyles = () => {
								switch (chipType) {
									case "tool":
										return {
											backgroundColor: "rgba(34, 197, 94, 0.35)", // green-500 at 35%
											color: "rgb(21, 128, 61)", // green-700
											borderColor: "rgba(34, 197, 94, 0.6)", // green-500 at 60%
											borderWidth: "2px",
										};
									case "function":
										return {
											backgroundColor: "rgba(168, 85, 247, 0.35)", // purple-500 at 35%
											color: "rgb(126, 34, 206)", // purple-700
											borderColor: "rgba(168, 85, 247, 0.6)", // purple-500 at 60%
											borderWidth: "2px",
										};
									case "parameter":
										return {
											backgroundColor: "rgba(249, 115, 22, 0.35)", // orange-500 at 35%
											color: "rgb(194, 65, 12)", // orange-700
											borderColor: "rgba(249, 115, 22, 0.6)", // orange-500 at 60%
											borderWidth: "2px",
										};
									case "agent":
										return {
											backgroundColor: "rgba(245, 158, 11, 0.40)", // amber-500 at 40% - more visible
											color: "rgb(180, 83, 9)", // amber-800
											borderColor: "rgba(245, 158, 11, 0.70)", // amber-500 at 70% - stronger border
											borderWidth: "2.5px", // Thicker border for agents
										};
									case "script":
										return {
											backgroundColor: "rgba(244, 63, 94, 0.35)", // rose-500 at 35%
											color: "rgb(190, 18, 60)", // rose-700
											borderColor: "rgba(244, 63, 94, 0.6)", // rose-500 at 60%
											borderWidth: "2px",
										};
									case "resource":
										return {
											backgroundColor: "rgba(6, 182, 212, 0.35)", // cyan-500 at 35%
											color: "rgb(14, 116, 144)", // cyan-700
											borderColor: "rgba(6, 182, 212, 0.6)", // cyan-500 at 60%
											borderWidth: "2px",
										};
									case "automation":
										return {
											backgroundColor: "rgba(99, 102, 241, 0.35)", // indigo-500 at 35%
											color: "rgb(67, 56, 202)", // indigo-700
											borderColor: "rgba(99, 102, 241, 0.6)", // indigo-500 at 60%
											borderWidth: "2px",
										};
									case "variable":
									default:
										return {
											backgroundColor: "rgba(59, 130, 246, 0.35)", // blue-500 at 35%
											color: "rgb(29, 78, 216)", // blue-700
											borderColor: "rgba(59, 130, 246, 0.6)", // blue-500 at 60%
											borderWidth: "2px",
										};
								}
							};

							const isDarkMode =
								document.documentElement.classList.contains("dark");
							const styles = getChipStyles();

							// Adjust colors for dark mode with better contrast
							if (isDarkMode) {
								switch (chipType) {
									case "tool":
										styles.color = "rgb(134, 239, 172)"; // green-300
										styles.backgroundColor = "rgba(34, 197, 94, 0.25)";
										break;
									case "function":
										styles.color = "rgb(216, 180, 254)"; // purple-300
										styles.backgroundColor = "rgba(168, 85, 247, 0.25)";
										break;
									case "parameter":
										styles.color = "rgb(253, 186, 116)"; // orange-300
										styles.backgroundColor = "rgba(249, 115, 22, 0.25)";
										break;
									case "agent":
										styles.color = "rgb(252, 211, 77)"; // amber-300 - bright in dark mode
										styles.backgroundColor = "rgba(245, 158, 11, 0.30)";
										styles.borderColor = "rgba(245, 158, 11, 0.60)";
										break;
									case "script":
										styles.color = "rgb(251, 113, 133)"; // rose-300
										styles.backgroundColor = "rgba(244, 63, 94, 0.25)";
										break;
									case "resource":
										styles.color = "rgb(103, 232, 249)"; // cyan-300
										styles.backgroundColor = "rgba(6, 182, 212, 0.25)";
										break;
									case "automation":
										styles.color = "rgb(165, 180, 252)"; // indigo-300
										styles.backgroundColor = "rgba(99, 102, 241, 0.25)";
										break;
									case "variable":
									default:
										styles.color = "rgb(147, 197, 253)"; // blue-300
										styles.backgroundColor = "rgba(59, 130, 246, 0.25)";
										break;
								}
							}

							return (
								<div
									key={key}
									className={cn(
										"inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-semibold",
										isLocked && "opacity-60",
									)}
									style={styles}
									title={
										isLocked
											? `🔒 ${chipType.charAt(0).toUpperCase() + chipType.slice(1)}: ${def.description || key} (Requires Starter+ plan)`
											: `${chipType.charAt(0).toUpperCase() + chipType.slice(1)}: ${def.description || key}`
									}
								>
									{isLocked && <Lock className="h-3 w-3 shrink-0" />}
									{def.icon && !isLocked && (
										<span className="inline-flex shrink-0 items-center justify-center">
											{def.icon}
										</span>
									)}
									<span className="font-mono">{`{{${key}}}`}</span>
									{count > 1 && (
										<span className="ml-1 opacity-70 text-[10px]">
											×{count}
										</span>
									)}
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}
