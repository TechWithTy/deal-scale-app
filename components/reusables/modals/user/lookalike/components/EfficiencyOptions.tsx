/**
 * Efficiency Options Component (Reusable)
 * Deduplication and cost-saving filter options
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
import { Label } from "@/components/ui/label";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "../types";

interface EfficiencyOptionsProps {
	form: UseFormReturn<FormValues>;
	nested?: boolean;
}

/**
 * Renders efficiency and deduplication options
 * Can be used standalone or as nested expandable
 */
export function EfficiencyOptions({
	form,
	nested = false,
}: EfficiencyOptionsProps) {
	const content = (
		<div className="grid grid-cols-1 gap-3">
			<label className="flex items-center gap-2">
				<Checkbox
					checked={form.watch("skipDuplicates") ?? true}
					onCheckedChange={(checked) =>
						form.setValue("skipDuplicates", Boolean(checked))
					}
				/>
				<div className="flex-1">
					<span className="font-medium text-sm">Skip Duplicate Leads</span>
					<p className="text-muted-foreground text-xs">
						Exclude leads that already exist in your system
					</p>
				</div>
			</label>

			<label className="flex items-center gap-2">
				<Checkbox
					checked={form.watch("skipAlreadyTraced") ?? true}
					onCheckedChange={(checked) =>
						form.setValue("skipAlreadyTraced", Boolean(checked))
					}
				/>
				<div className="flex-1">
					<span className="font-medium text-sm">Skip Already Skip-Traced</span>
					<p className="text-muted-foreground text-xs">
						Exclude leads you've already enriched to avoid duplicate charges
					</p>
				</div>
			</label>

			<label className="flex items-center gap-2">
				<Checkbox
					checked={form.watch("skipExistingCampaigns") ?? true}
					onCheckedChange={(checked) =>
						form.setValue("skipExistingCampaigns", Boolean(checked))
					}
				/>
				<div className="flex-1">
					<span className="font-medium text-sm">
						Skip Leads in Active Campaigns
					</span>
					<p className="text-muted-foreground text-xs">
						Exclude leads currently being contacted to avoid double outreach
					</p>
				</div>
			</label>

			<label className="flex items-center gap-2">
				<Checkbox
					checked={form.watch("skipDncList") ?? true}
					onCheckedChange={(checked) =>
						form.setValue("skipDncList", Boolean(checked))
					}
				/>
				<div className="flex-1">
					<span className="font-medium text-sm">Skip Your DNC List</span>
					<p className="text-muted-foreground text-xs">
						Exclude leads on your personal Do Not Contact list
					</p>
				</div>
			</label>

			<label className="flex items-center gap-2">
				<Checkbox
					checked={form.watch("skipPreviouslyContacted") ?? false}
					onCheckedChange={(checked) =>
						form.setValue("skipPreviouslyContacted", Boolean(checked))
					}
				/>
				<div className="flex-1">
					<span className="font-medium text-sm">Skip Previously Contacted</span>
					<p className="text-muted-foreground text-xs">
						Exclude all leads you've ever contacted (includes closed campaigns)
					</p>
				</div>
			</label>
		</div>
	);

	if (nested) {
		return (
			<Accordion
				type="single"
				collapsible
				className="rounded-lg border border-primary/20 bg-primary/5"
			>
				<AccordionItem value="efficiency" className="border-none">
					<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
						⚡ Efficiency Options
					</AccordionTrigger>
					<AccordionContent className="px-3 pb-3">{content}</AccordionContent>
				</AccordionItem>
			</Accordion>
		);
	}

	return (
		<div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
			<Label className="flex items-center gap-2 font-semibold text-sm">
				⚡ Efficiency Options
			</Label>
			{content}
		</div>
	);
}
