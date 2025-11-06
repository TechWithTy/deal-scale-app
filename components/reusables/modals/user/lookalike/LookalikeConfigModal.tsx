/**
 * Lookalike Audience Configuration Modal
 * Main modal for configuring and generating lookalike audiences
 * @module lookalike/modals
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
import type { LookalikeConfig } from "@/types/lookalike";
import { estimateAudienceSize } from "@/lib/api/lookalike/generate";
import { toast } from "sonner";
import { lookalikeConfigSchema, type FormValues } from "./types";
import { buildLookalikeConfig } from "./utils/configBuilder";
import { SimilaritySettings } from "./components/SimilaritySettings";
import { SalesTargeting } from "./components/SalesTargeting";
import { PropertyFilters } from "./components/PropertyFilters";
import { GeographicFilters } from "./components/GeographicFilters";
import { GeneralOptions } from "./components/GeneralOptions";
import { CostSummary } from "./components/CostSummary";

interface LookalikeConfigModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	seedListId: string;
	seedListName: string;
	seedLeadCount: number;
	onGenerate: (config: LookalikeConfig) => void;
	onSaveConfig?: (config: LookalikeConfig, configName: string) => void;
	initialConfig?: Partial<FormValues>;
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
			requireEmail: initialConfig?.requireEmail ?? false,
			enrichmentLevel: initialConfig?.enrichmentLevel ?? "premium",
			enrichmentRequired: initialConfig?.enrichmentRequired ?? false,
			cashBuyerOnly: initialConfig?.cashBuyerOnly ?? false,
			corporateOwnership: initialConfig?.corporateOwnership || "all",
			absenteeOwner: initialConfig?.absenteeOwner || "all",
			...initialConfig,
		},
	});

	const watchedValues = form.watch();

	// Validation logic
	const isValidSeedList = seedLeadCount > 0;
	const hasTargetSize = (watchedValues.targetSize || 0) > 0;
	const canGenerate = isValidSeedList && hasTargetSize && !isGenerating;

	const validationErrors: string[] = [];
	if (!isValidSeedList) {
		validationErrors.push("Please select a seed list with leads");
	}
	if (!hasTargetSize) {
		validationErrors.push("Target audience size must be greater than 0");
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

	/** Debounced audience size estimation */
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
				);
				const size = await estimateAudienceSize(config);
				setEstimatedSize(size);
			} catch (error) {
				console.error("Failed to estimate audience size:", error);
			} finally {
				setIsEstimating(false);
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [isOpen, watchedValues, seedListId, seedListName, seedLeadCount]);

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
			);
			console.log("[LookalikeConfig] Built config:", config);
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
			<DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
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
						<Accordion type="multiple" className="space-y-2">
							<AccordionItem value="sales" className="rounded-lg border px-4">
								<AccordionTrigger className="font-semibold text-base">
									Sales & Audience Targeting
								</AccordionTrigger>
								<SalesTargeting form={form} />
							</AccordionItem>

							<AccordionItem
								value="property"
								className="rounded-lg border px-4"
							>
								<AccordionTrigger className="font-semibold text-base">
									Property Filters
								</AccordionTrigger>
								<PropertyFilters form={form} />
							</AccordionItem>

							<AccordionItem value="geo" className="rounded-lg border px-4">
								<AccordionTrigger className="font-semibold text-base">
									Geographic Filters
								</AccordionTrigger>
								<GeographicFilters form={form} />
							</AccordionItem>

							<AccordionItem value="general" className="rounded-lg border px-4">
								<AccordionTrigger className="font-semibold text-base">
									General Options
								</AccordionTrigger>
								<GeneralOptions form={form} />
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
