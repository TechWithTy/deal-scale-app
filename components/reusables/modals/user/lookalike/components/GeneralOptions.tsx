/**
 * General Options Component
 * Compliance, enrichment, and data quality settings
 * @module lookalike/components
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FeatureGuard } from "@/components/access/FeatureGuard";
import type { FormValues } from "../types";

interface GeneralOptionsProps {
	form: UseFormReturn<FormValues>;
}

/**
 * Renders general configuration options
 * Includes compliance settings, enrichment levels, and data quality filters
 */
export function GeneralOptions({ form }: GeneralOptionsProps) {
	return (
		<AccordionContent className="space-y-4 pt-4">
			<div className="grid grid-cols-2 gap-4">
				<label className="flex items-center gap-2 opacity-60 cursor-not-allowed">
					<Checkbox checked={true} disabled={true} />
					<span className="text-sm">DNC Compliance (exclude DNC numbers)</span>
				</label>

				<label className="flex items-center gap-2 opacity-60 cursor-not-allowed">
					<Checkbox checked={true} disabled={true} />
					<span className="text-sm">TCPA Opt-In Required</span>
				</label>

				<label className="flex items-center gap-2 opacity-60 cursor-not-allowed">
					<Checkbox checked={true} disabled={true} />
					<span className="text-sm">Require Valid Phone</span>
				</label>

				<label className="flex items-center gap-2">
					<Checkbox
						checked={form.watch("requireEmail")}
						onCheckedChange={(checked) =>
							form.setValue("requireEmail", Boolean(checked))
						}
					/>
					<span className="text-sm">Require Valid Email</span>
				</label>
			</div>

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
						<SelectItem value="premium">Premium (Available to all)</SelectItem>
						<FeatureGuard
							featureKey="lookalike.enrichment.hybrid"
							fallbackMode="disable"
							fallbackTier="Enterprise"
						>
							<SelectItem value="hybrid">Hybrid (Free + Premium)</SelectItem>
						</FeatureGuard>
					</SelectContent>
				</Select>
				<p className="mt-1 text-xs text-muted-foreground">
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

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="recency">Data Recency (days)</Label>
					<Input
						id="recency"
						type="number"
						{...form.register("dataRecencyDays", { valueAsNumber: true })}
						placeholder="90"
					/>
				</div>

				<div>
					<Label htmlFor="corporate" className="whitespace-nowrap">
						Corporate Ownership
					</Label>
					<Select
						value={form.watch("corporateOwnership") || "all"}
						onValueChange={(value) =>
							form.setValue("corporateOwnership", value)
						}
					>
						<SelectTrigger id="corporate">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">No preference</SelectItem>
							<SelectItem value="only">Only corporate</SelectItem>
							<SelectItem value="exclude">Exclude corporate</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div>
				<Label htmlFor="absentee" className="whitespace-nowrap">
					Absentee Owner
				</Label>
				<Select
					value={form.watch("absenteeOwner") || "all"}
					onValueChange={(value) => form.setValue("absenteeOwner", value)}
				>
					<SelectTrigger id="absentee">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">No preference</SelectItem>
						<SelectItem value="only">Only absentee</SelectItem>
						<SelectItem value="exclude">Exclude absentee</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</AccordionContent>
	);
}
