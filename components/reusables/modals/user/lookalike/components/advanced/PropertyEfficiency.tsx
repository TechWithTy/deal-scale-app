/**
 * Property-Specific Efficiency Options
 * Property-focused cost-saving filters
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

export function PropertyEfficiency({
	form,
}: { form: UseFormReturn<FormValues> }) {
	return (
		<Accordion
			type="single"
			collapsible
			className="rounded-lg border border-primary/20 bg-primary/5"
		>
			<AccordionItem value="property-efficiency" className="border-none">
				<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
					⚡ Property Efficiency
				</AccordionTrigger>
				<AccordionContent className="space-y-2 px-3 pb-3">
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipAlreadyTraced") ?? true}
							onCheckedChange={(checked) =>
								form.setValue("skipAlreadyTraced", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Already Skip-Traced</span>
							<p className="text-muted-foreground text-xs">
								Avoid duplicate enrichment costs
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipRecentlySold") ?? true}
							onCheckedChange={(checked) =>
								form.setValue("skipRecentlySold", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Recently Sold</span>
							<p className="text-muted-foreground text-xs">
								Exclude properties sold in last 12 months
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipListedProperties") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("skipListedProperties", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Currently Listed</span>
							<p className="text-muted-foreground text-xs">
								Exclude properties actively on market
							</p>
						</div>
					</label>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
