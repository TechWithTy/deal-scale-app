/**
 * Lookalike Audience Configuration Modal
 * Main modal for configuring and generating lookalike audiences
 * @module lookalike/modals
 */

"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
import { estimateAudienceSize } from "@/lib/api/lookalike/generate";
import type {
	QuickStartGoalId,
	QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";
import {
	getGoalDefinition,
	getPersonaDefinition,
} from "@/lib/config/quickstart/wizardFlows";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import type { LookalikeConfig } from "@/types/lookalike";
import type { SavedSearch } from "@/types/userProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Target, TrendingUp, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AdvancedOptions } from "./components/AdvancedOptions";
import { ComplianceOptions } from "./components/ComplianceOptions";
import { CostSummary } from "./components/CostSummary";
import { EfficiencyOptions } from "./components/EfficiencyOptions";
import { GeographicFilters } from "./components/GeographicFilters";
import { PropertyFilters } from "./components/PropertyFilters";
import { SalesTargeting } from "./components/SalesTargeting";
import { SimilaritySettings } from "./components/SimilaritySettings";
import { SocialEnrichmentAdvanced } from "./components/SocialEnrichmentAdvanced";
import { type FormValues, lookalikeConfigSchema } from "./types";
import { buildLookalikeConfig } from "./utils/configBuilder";

interface LookalikeConfigModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	seedListId: string;
	seedListName: string;
	seedLeadCount: number;
	onGenerate: (config: LookalikeConfig) => void;
	onSaveConfig?: (config: LookalikeConfig, configName: string) => void;
	initialConfig?: Partial<FormValues>;
	savedSearch?: SavedSearch;
	userPersona?: QuickStartPersonaId;
	userGoal?: QuickStartGoalId;
}

/**
 * Main modal component for lookalike audience configuration
 * Provides comprehensive filtering and targeting options
 */
export function LookalikeConfigModal({
	isOpen,
	onOpenChange,
	seedListId,
	seedListName,
	seedLeadCount,
	onGenerate,
	onSaveConfig,
	initialConfig,
	savedSearch,
	userPersona,
	userGoal,
}: LookalikeConfigModalProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
	const [isEstimating, setIsEstimating] = useState(false);
	const [isSavingConfig, setIsSavingConfig] = useState(false);
	const [configName, setConfigName] = useState("");

	const form = useForm<FormValues>({
		resolver: zodResolver(lookalikeConfigSchema),
		defaultValues: {
			similarityThreshold: initialConfig?.similarityThreshold || 75,
			targetSize: initialConfig?.targetSize || 100,
			dncCompliance: true,
			tcpaOptInRequired: true,
			requirePhone: true,
			enrichmentLevel: initialConfig?.enrichmentLevel ?? "premium",
			enrichmentRequired: initialConfig?.enrichmentRequired ?? false,
			cashBuyerOnly: initialConfig?.cashBuyerOnly ?? false,
			corporateOwnership: initialConfig?.corporateOwnership || "all",
			absenteeOwner: initialConfig?.absenteeOwner || "all",
			// Efficiency options - default to true for optimal cost savings
			skipDuplicates: initialConfig?.skipDuplicates ?? true,
			skipAlreadyTraced: initialConfig?.skipAlreadyTraced ?? true,
			skipExistingCampaigns: initialConfig?.skipExistingCampaigns ?? true,
			skipDncList: initialConfig?.skipDncList ?? true,
			skipPreviouslyContacted: initialConfig?.skipPreviouslyContacted ?? false,
			// Social enrichment options - ENABLED BY DEFAULT
			socialEnrichment: initialConfig?.socialEnrichment ?? true,
			includeFacebook: initialConfig?.includeFacebook ?? true,
			includeLinkedIn: initialConfig?.includeLinkedIn ?? true,
			includeInstagram: initialConfig?.includeInstagram ?? true,
			includeFriendsData: initialConfig?.includeFriendsData ?? true,
			includeInterests: initialConfig?.includeInterests ?? true,
			includeEmployment: initialConfig?.includeEmployment ?? true,
			includeUsername: initialConfig?.includeUsername ?? true,
			includeSocialDossier: initialConfig?.includeSocialDossier ?? false,
			requireEmail: initialConfig?.requireEmail ?? true,
			...initialConfig,
		},
	});

	const watchedValues = form.watch();

	// Create a stable reference for estimation-relevant fields only
	const estimationKey = useMemo(
		() =>
			JSON.stringify({
				similarityThreshold: watchedValues.similarityThreshold,
				targetSize: watchedValues.targetSize,
				seedListId,
				seedLeadCount,
			}),
		[
			watchedValues.similarityThreshold,
			watchedValues.targetSize,
			seedListId,
			seedLeadCount,
		],
	);

	// Validation logic with edge cases
	const socialEnrichmentEnabled = watchedValues.socialEnrichment ?? false;
	const isValidSeedList = seedLeadCount > 0;
	const hasTargetSize = (watchedValues.targetSize || 0) > 0;
	const targetSizeValid =
		(watchedValues.targetSize || 0) >= 10 &&
		(watchedValues.targetSize || 0) <= 10000;
	const canGenerate =
		isValidSeedList && hasTargetSize && targetSizeValid && !isGenerating;

	const validationErrors: string[] = [];
	if (!isValidSeedList) {
		validationErrors.push("Please select a seed list with leads");
	}
	if (!hasTargetSize) {
		validationErrors.push("Target audience size must be greater than 0");
	}
	if (hasTargetSize && !targetSizeValid) {
		validationErrors.push("Target size must be between 10 and 10,000");
	}
	if (
		socialEnrichmentEnabled &&
		seedLeadCount > 0 &&
		!watchedValues.requireEmail
	) {
		validationErrors.push("Email is required for social enrichment");
	}

	// Debug logging (in render, not useEffect to avoid dependency issues)
	if (isOpen) {
		console.log("[LookalikeConfigModal] Props received:", {
			seedListId,
			seedListName,
			seedLeadCount,
			isValidSeedList,
			targetSize: watchedValues.targetSize,
			canGenerate,
		});
	}

	/** Debounced audience size estimation - only runs when relevant fields change */
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!isOpen) return;

		const timer = setTimeout(async () => {
			setIsEstimating(true);
			try {
				const config = buildLookalikeConfig(
					watchedValues,
					seedListId,
					seedListName,
					seedLeadCount,
					userPersona,
					userGoal,
				);
				const size = await estimateAudienceSize(config);
				setEstimatedSize(size);
			} catch (error) {
				console.error("Failed to estimate audience size:", error);
			} finally {
				setIsEstimating(false);
			}
		}, 1500);

		return () => clearTimeout(timer);
	}, [isOpen, estimationKey, userPersona, userGoal]);

	/** Handles form submission and audience generation */
	const handleGenerate = async (values: FormValues) => {
		console.log("[LookalikeConfig] handleGenerate called with values:", values);
		setIsGenerating(true);
		try {
			const config = buildLookalikeConfig(
				values,
				seedListId,
				seedListName,
				seedLeadCount,
				userPersona,
				userGoal,
			);
			console.log("[LookalikeConfig] Built config with persona/goal:", config);
			await onGenerate(config);
			toast.success("Lookalike audience generated successfully!");
		} catch (error) {
			toast.error("Failed to generate audience");
			console.error("[LookalikeConfig] Error:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	/** Resets all form fields to defaults */
	const handleReset = () => {
		form.reset();
		toast.info("Filters reset to defaults");
	};

	/** Saves the current configuration for reuse */
	const handleSaveConfiguration = async () => {
		if (!configName.trim()) {
			toast.error("Please enter a configuration name");
			return;
		}

		if (!onSaveConfig) {
			toast.error("Save configuration is not available");
			return;
		}

		setIsSavingConfig(true);
		try {
			const values = form.getValues();
			const config = buildLookalikeConfig(
				values,
				seedListId,
				seedListName,
				seedLeadCount,
				userPersona,
				userGoal,
			);
			await onSaveConfig(config, configName);
			toast.success(`Configuration "${configName}" saved!`);
			setConfigName("");
		} catch (error) {
			toast.error("Failed to save configuration");
			console.error(error);
		} finally {
			setIsSavingConfig(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="mx-4 flex max-h-[90vh] max-w-4xl flex-col overflow-hidden sm:mx-auto">
				<DialogHeader>
					<DialogTitle>Configure Look-Alike Audience</DialogTitle>
					<DialogDescription>
						Generate similar prospects based on{" "}
						<strong>{seedListName || "Seed List"}</strong> (
						<span
							className={
								seedLeadCount === 0 ? "font-semibold text-destructive" : ""
							}
						>
							{seedLeadCount.toLocaleString()} leads
						</span>
						). Adjust filters to refine your audience.
					</DialogDescription>

					{/* User Persona & Goal */}
					{(userPersona || userGoal) && (
						<div className="mt-3 flex flex-wrap gap-2">
							{userPersona && (
								<Badge variant="secondary" className="gap-1.5">
									<User className="h-3 w-3" />
									{getPersonaDefinition(userPersona)?.title || userPersona}
								</Badge>
							)}
							{userGoal && (
								<Badge variant="secondary" className="gap-1.5">
									<Target className="h-3 w-3" />
									{getGoalDefinition(userGoal)?.title || userGoal}
								</Badge>
							)}
						</div>
					)}

					{/* Validation Errors */}
					{validationErrors.length > 0 && (
						<div className="mt-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
							<div className="flex items-start gap-2">
								<AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
								<div className="space-y-1">
									<p className="font-semibold text-destructive text-sm">
										Cannot Generate Audience
									</p>
									<ul className="list-inside list-disc space-y-0.5 text-destructive/90 text-xs">
										{validationErrors.map((error) => (
											<li key={error}>{error}</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					)}
				</DialogHeader>

				<div className="flex-1 overflow-y-auto pr-2">
					<form
						onSubmit={form.handleSubmit(handleGenerate)}
						className="space-y-6"
					>
						{/* Similarity Settings */}
						<SimilaritySettings
							form={form}
							estimatedSize={estimatedSize}
							isEstimating={isEstimating}
						/>

						{/* Accordion for all other filters */}
						<Accordion
							type="multiple"
							className="space-y-2"
							defaultValue={["sales", "geo"]}
						>
							<AccordionItem value="sales" className="rounded-lg border px-4">
								<AccordionTrigger className="font-semibold text-base">
									Audience & Sales Targeting
								</AccordionTrigger>
								<SalesTargeting form={form} />
							</AccordionItem>

							<AccordionItem value="geo" className="rounded-lg border px-4">
								<AccordionTrigger className="font-semibold text-base">
									Geographic Filters
								</AccordionTrigger>
								<GeographicFilters form={form} />
							</AccordionItem>

							<AccordionItem
								value="property"
								className="rounded-lg border px-4"
							>
								<AccordionTrigger className="font-semibold text-base">
									🏠 Property Filters
								</AccordionTrigger>
								<AccordionContent className="pt-4">
									<PropertyFilters form={form} />
								</AccordionContent>
							</AccordionItem>

							<AccordionItem
								value="social"
								className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4"
							>
								<AccordionTrigger className="font-semibold text-base">
									📱 Social Enrichment
									<Badge
										variant="outline"
										className="ml-2 bg-blue-500/10 text-[10px]"
									>
										Optional
									</Badge>
								</AccordionTrigger>
								<AccordionContent className="pt-4">
									<SocialEnrichmentAdvanced form={form} />
								</AccordionContent>
							</AccordionItem>

							<AccordionItem
								value="compliance"
								className="rounded-lg border border-green-500/30 bg-green-500/5 px-4"
							>
								<AccordionTrigger className="font-semibold text-base">
									✓ Compliance & Data Quality
								</AccordionTrigger>
								<AccordionContent className="pt-4">
									<ComplianceOptions form={form} />
								</AccordionContent>
							</AccordionItem>

							<AccordionItem
								value="efficiency"
								className="rounded-lg border border-primary/30 bg-primary/5 px-4"
							>
								<AccordionTrigger className="font-semibold text-base">
									⚡ Efficiency Options
								</AccordionTrigger>
								<AccordionContent className="pt-4">
									<EfficiencyOptions form={form} nested={false} />
								</AccordionContent>
							</AccordionItem>
						</Accordion>

						{/* Save Configuration */}
						{onSaveConfig && (
							<div className="space-y-3 rounded-lg border bg-muted/30 p-4">
								<Label className="whitespace-nowrap font-semibold text-sm">
									Save This Configuration
								</Label>
								<p className="text-muted-foreground text-xs">
									Save these filter settings to reuse later from Saved Searches.
								</p>
								<div className="flex gap-2">
									<Input
										placeholder="Enter configuration name..."
										value={configName}
										onChange={(e) => setConfigName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleSaveConfiguration();
											}
										}}
									/>
									<Button
										type="button"
										onClick={handleSaveConfiguration}
										disabled={isSavingConfig || !configName.trim()}
										variant="secondary"
										className="whitespace-nowrap"
									>
										{isSavingConfig ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											"Save Config"
										)}
									</Button>
								</div>
							</div>
						)}

						{/* Cost Summary */}
						<CostSummary values={watchedValues} />

						{/* Action Buttons */}
						<div className="flex items-center justify-between border-t pt-4">
							<Button type="button" variant="outline" onClick={handleReset}>
								Reset All Filters
							</Button>

							<div className="flex gap-3">
								<Button
									type="button"
									variant="ghost"
									onClick={() => onOpenChange(false)}
									disabled={isGenerating}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={!canGenerate}
									title={
										!canGenerate && !isGenerating
											? validationErrors.join(", ")
											: ""
									}
								>
									{isGenerating ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Generating...
										</>
									) : (
										<>
											<TrendingUp className="mr-2 h-4 w-4" />
											Generate Audience
										</>
									)}
								</Button>
							</div>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
