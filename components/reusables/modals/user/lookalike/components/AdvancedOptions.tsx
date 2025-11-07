/**
 * Advanced Options Component (Reusable)
 * Additional advanced filtering and targeting options
 * @module lookalike/components
 */

"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
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

interface AdvancedOptionsProps {
	form: UseFormReturn<FormValues>;
	nested?: boolean;
}

/**
 * Renders advanced targeting options
 * Can be used standalone or as nested expandable
 */
export function AdvancedOptions({
	form,
	nested = false,
}: AdvancedOptionsProps) {
	const content = (
		<div className="space-y-3">
			{/* Intent Levels */}
			<div>
				<Label>Intent Levels</Label>
				<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
					{["high", "medium", "low"].map((level) => (
						<label key={level} className="flex items-center gap-2">
							<Checkbox
								checked={form.watch("intentLevels")?.includes(level)}
								onCheckedChange={(checked) => {
									const current = form.watch("intentLevels") || [];
									form.setValue(
										"intentLevels",
										checked
											? [...current, level]
											: current.filter((l) => l !== level),
									);
								}}
							/>
							<span className="text-sm capitalize">{level}</span>
						</label>
					))}
				</div>
			</div>

			{/* Enrichment Requirements */}
			<label className="flex items-center gap-2">
				<Checkbox
					checked={form.watch("enrichmentRequired") ?? false}
					onCheckedChange={(checked) =>
						form.setValue("enrichmentRequired", Boolean(checked))
					}
				/>
				<div className="flex-1">
					<span className="font-medium text-sm">Require Full Enrichment</span>
					<p className="text-muted-foreground text-xs">
						Only include leads with complete enrichment data (may reduce
						results)
					</p>
				</div>
			</label>

			{/* Exclude Specific Lists */}
			<div>
				<Label htmlFor="excludeLists">
					Exclude Lists (comma-separated IDs)
				</Label>
				<Input
					id="excludeLists"
					placeholder="list_123, list_456"
					value={(form.watch("excludeListIds") || []).join(", ")}
					onChange={(e) => {
						const ids = e.target.value
							.split(",")
							.map((id) => id.trim())
							.filter(Boolean);
						form.setValue("excludeListIds", ids);
					}}
				/>
				<p className="mt-1 text-muted-foreground text-xs">
					Exclude specific lead lists from results
				</p>
			</div>

			{/* Additional Property Filters */}
			<div>
				<Label>Lot Size (sqft)</Label>
				<div className="mt-1 flex gap-2">
					<Input
						type="number"
						placeholder="Min"
						{...form.register("lotSizeMin", { valueAsNumber: true })}
					/>
					<Input
						type="number"
						placeholder="Max"
						{...form.register("lotSizeMax", { valueAsNumber: true })}
					/>
				</div>
			</div>
		</div>
	);

	if (nested) {
		return (
			<Accordion
				type="single"
				collapsible
				className="rounded-lg border border-muted-foreground/20 bg-muted/30"
			>
				<AccordionItem value="advanced" className="border-none">
					<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
						🔧 Advanced Options
					</AccordionTrigger>
					<AccordionContent className="px-3 pb-3">{content}</AccordionContent>
				</AccordionItem>
			</Accordion>
		);
	}

	return (
		<div className="space-y-3 rounded-lg border border-muted-foreground/20 bg-muted/30 p-3">
			<Label className="flex items-center gap-2 font-semibold text-sm">
				🔧 Advanced Options
			</Label>
			{content}
		</div>
	);
}
