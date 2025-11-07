/**
 * Geographic-Specific Efficiency Options
 * Location-based cost-saving filters
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

export function GeographicEfficiency({
	form,
}: { form: UseFormReturn<FormValues> }) {
	return (
		<Accordion
			type="single"
			collapsible
			className="rounded-lg border border-primary/20 bg-primary/5"
		>
			<AccordionItem value="geo-efficiency" className="border-none">
				<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
					⚡ Geographic Efficiency
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
							<span className="text-sm">Skip Duplicate Addresses</span>
							<p className="text-muted-foreground text-xs">
								Exclude properties already in system
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipOverlappingAreas") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("skipOverlappingAreas", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Overlapping Areas</span>
							<p className="text-muted-foreground text-xs">
								Remove areas you've already targeted recently
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("consolidateByMarket") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("consolidateByMarket", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Consolidate by Market</span>
							<p className="text-muted-foreground text-xs">
								Group nearby properties for route optimization
							</p>
						</div>
					</label>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
