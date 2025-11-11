/**
 * Compliance Options Component
 * DNC, TCPA, and data quality/efficiency settings
 * @module lookalike/components
 */

"use client";

import { FeatureGuard } from "@/components/access/FeatureGuard";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "../types";
import { ComplianceAdvanced } from "./advanced/ComplianceAdvanced";
import { ComplianceEfficiency } from "./advanced/ComplianceEfficiency";

interface ComplianceOptionsProps {
	form: UseFormReturn<FormValues>;
}

/**
 * Renders compliance, data quality, and efficiency options
 */
export function ComplianceOptions({ form }: ComplianceOptionsProps) {
	const socialEnrichmentEnabled = form.watch("socialEnrichment") ?? false;

	return (
		<div className="space-y-4">
			{/* Required Compliance (Always On) */}
			<div className="space-y-3 rounded-lg border border-green-500/30 bg-green-500/5 p-3">
				<Label className="flex items-center gap-2 font-semibold text-sm">
					✓ Required Compliance
				</Label>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<label className="flex cursor-not-allowed items-center gap-2 opacity-60">
						<Checkbox checked={true} disabled={true} />
						<span className="text-sm">DNC Compliance</span>
					</label>

					<label className="flex cursor-not-allowed items-center gap-2 opacity-60">
						<Checkbox checked={true} disabled={true} />
						<span className="text-sm">TCPA Opt-In Required</span>
					</label>

					<label className="flex cursor-not-allowed items-center gap-2 opacity-60">
						<Checkbox checked={true} disabled={true} />
						<span className="text-sm">Require Valid Phone</span>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("requireEmail") || socialEnrichmentEnabled}
							onCheckedChange={(checked) => {
								if (!socialEnrichmentEnabled) {
									form.setValue("requireEmail", Boolean(checked));
								}
							}}
							disabled={socialEnrichmentEnabled}
						/>
						<div className="flex-1">
							<span className="text-sm">Require Valid Email</span>
							{socialEnrichmentEnabled && (
								<p className="text-muted-foreground text-xs">
									Required for social enrichment
								</p>
							)}
						</div>
					</label>
				</div>
			</div>

			{/* Data Quality & Enrichment */}
			<div className="space-y-3">
				<Label className="font-semibold text-sm">
					Data Quality & Enrichment
				</Label>

				<div>
					<Label htmlFor="enrichmentLevel">Enrichment Level</Label>
					<Select
						value={form.watch("enrichmentLevel") || "premium"}
						onValueChange={(value) =>
							form.setValue(
								"enrichmentLevel",
								value as "none" | "free" | "premium" | "hybrid",
							)
						}
					>
						<SelectTrigger id="enrichmentLevel">
							<SelectValue placeholder="Select enrichment level" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">None (No enrichment)</SelectItem>
							<FeatureGuard
								featureKey="lookalike.enrichment.free"
								fallbackMode="disable"
								fallbackTier="Starter"
							>
								<SelectItem value="free">Free (Basic enrichment)</SelectItem>
							</FeatureGuard>
							<SelectItem value="premium">
								Premium (Available to all)
							</SelectItem>
							<FeatureGuard
								featureKey="lookalike.enrichment.hybrid"
								fallbackMode="disable"
								fallbackTier="Enterprise"
							>
								<SelectItem value="hybrid">Hybrid (Free + Premium)</SelectItem>
							</FeatureGuard>
						</SelectContent>
					</Select>
					<p className="mt-1 text-muted-foreground text-xs">
						{form.watch("enrichmentLevel") === "none" &&
							"No additional data enrichment will be applied"}
						{form.watch("enrichmentLevel") === "free" &&
							"Basic enrichment with free data sources"}
						{form.watch("enrichmentLevel") === "premium" &&
							"Premium enrichment provides the most accurate and complete data"}
						{form.watch("enrichmentLevel") === "hybrid" &&
							"Combines free and premium data sources for optimal coverage"}
					</p>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
					<div>
						<Label htmlFor="recency">Data Recency (days)</Label>
						<Input
							id="recency"
							type="number"
							{...form.register("dataRecencyDays", { valueAsNumber: true })}
							placeholder="90"
						/>
					</div>
				</div>
			</div>

			{/* Compliance-Specific Nested Options */}
			<ComplianceEfficiency form={form} />
			<ComplianceAdvanced form={form} />
		</div>
	);
}
