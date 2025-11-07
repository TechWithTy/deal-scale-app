/**
 * Sales-Specific Efficiency Options
 * Cost-saving filters for sales targeting
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
import type { FormValues } from "../../types";

export function SalesEfficiency({ form }: { form: UseFormReturn<FormValues> }) {
	return (
		<Accordion
			type="single"
			collapsible
			className="rounded-lg border border-primary/20 bg-primary/5"
		>
			<AccordionItem value="sales-efficiency" className="border-none">
				<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
					⚡ Sales Efficiency
				</AccordionTrigger>
				<AccordionContent className="space-y-2 px-3 pb-3">
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipDuplicates") ?? true}
							onCheckedChange={(checked) =>
								form.setValue("skipDuplicates", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Duplicate Leads</span>
							<p className="text-muted-foreground text-xs">
								Exclude leads already in your CRM
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
							<span className="text-sm">Skip Active Campaigns</span>
							<p className="text-muted-foreground text-xs">
								Avoid double-contacting leads
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipColdLeads") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("skipColdLeads", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Cold Leads</span>
							<p className="text-muted-foreground text-xs">
								Exclude leads with no response in 6+ months
							</p>
						</div>
					</label>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
